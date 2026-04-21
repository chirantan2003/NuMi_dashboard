import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 1. Fetch IP-based Location and Weather
        let weatherData = null;
        let locationData = { city: "Unknown", region: "" };
        
        try {
            const locRes = await fetch('http://ip-api.com/json', { cache: 'no-store' });
            if (locRes.ok) {
                const loc = await locRes.json();
                locationData = { city: loc.city || "Unknown", region: loc.regionName || "" };
                
                // open-meteo using accurate lat/lon
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code&temperature_unit=celsius`, { cache: 'no-store' });
                if(weatherRes.ok) {
                    const wd = await weatherRes.json();
                    weatherData = {
                        temp: wd.current?.temperature_2m,
                        code: wd.current?.weather_code
                    };
                }
            }
        } catch(e) {
            console.error("Location/Weather fetch failed", e);
        }

        // 2. Fetch Oura Data using secure env key
        const ouraKey = process.env.OURA_API_KEY;
        let ouraMetrics = null;
        
        if (ouraKey) {
            try {
                const headers = { 'Authorization': `Bearer ${ouraKey} ` };

                const start = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const end = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const tagStart = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const responses = await Promise.all([
                    fetch(`https://api.ouraring.com/v2/usercollection/sleep?start_date=${start}&end_date=${end}`, { headers }),
                    fetch(`https://api.ouraring.com/v2/usercollection/daily_stress?start_date=${start}&end_date=${end}`, { headers }),
                    fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${start}&end_date=${end}`, { headers }),
                    fetch(`https://api.ouraring.com/v2/usercollection/tag?start_date=${tagStart}&end_date=${end}`, { headers }),
                    fetch(`https://api.ouraring.com/v2/usercollection/heartrate?start_datetime=${start}T00:00:00Z&end_datetime=${end}T23:59:59Z`, { headers }),
                    fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${start}&end_date=${end}`, { headers })
                ]);

                if (!responses.some(r => r.status === 401 || r.status === 403)) {
                    const jsonResults = await Promise.all(responses.map(r => r.json()));

                    const sleepData = (jsonResults[0].data || []).reverse().find((d: any) => d.total_sleep_duration);
                    const stressData = (jsonResults[1].data || []).reverse().find((d: any) => d.day_summary);
                    const activityData = (jsonResults[2].data || []).reverse().find((d: any) => d.score);
                    
                    const tagDataArray = (jsonResults[3].data || []).reverse();
                    const lastPeriodTag = tagDataArray.find((d: any) => d.tags && d.tags.includes('tag_generic_period'));
                    
                    const hrData = (jsonResults[4].data || []);
                    const readinessData = (jsonResults[5].data || []).reverse().find((d: any) => d.score);

                    let exactHr = null;
                    if(hrData.length > 0) {
                        const sortedHr = hrData.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        exactHr = sortedHr[0].bpm;
                    }

                    let cycleDayStr = "N/A";
                    if (lastPeriodTag && lastPeriodTag.timestamp) {
                        const tagDate = new Date(lastPeriodTag.timestamp);
                        const diffTime = Math.abs(new Date().getTime() - tagDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        cycleDayStr = diffDays.toString();
                    }

                    const sleepHours = sleepData?.total_sleep_duration ? Math.round(sleepData.total_sleep_duration / 3600) : 0;
                    const stressRaw = stressData?.day_summary || "Low";

                    ouraMetrics = {
                        sleep: sleepHours > 0 ? sleepHours.toString() : "0",
                        sleepScore: sleepData?.score,
                        stress: stressRaw.charAt(0).toUpperCase() + stressRaw.slice(1),
                        activity: activityData?.score ? activityData.score.toString() : "0",
                        cycleDay: cycleDayStr,
                        readinessScore: readinessData?.score,
                        heartRate: exactHr
                    };
                }
            } catch(e) {
                console.error("Oura fetch failed", e);
            }
        }

        return NextResponse.json({
            success: true,
            weather: weatherData,
            location: locationData,
            oura: ouraMetrics
        });

    } catch(err) {
        return NextResponse.json({ success: false, error: 'Internal fail' }, { status: 500 });
    }
}
