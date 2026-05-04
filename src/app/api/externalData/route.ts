import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // 1. Fetch IP-based Location and Weather
        let weatherData = null;
        let locationData = { city: "Unknown", region: "" };
        
        // Try to get client IP from headers to avoid server location (Virginia)
        const forwarded = request.headers.get('x-forwarded-for');
        const clientIp = forwarded ? forwarded.split(',')[0] : '';
        console.log(`[NuMi API] Client IP detected: ${clientIp}`);

        try {
            // Append client IP to ip-api URL to get client location
            const locUrl = clientIp ? `http://ip-api.com/json/${clientIp}` : 'http://ip-api.com/json';
            const locRes = await fetch(locUrl, { cache: 'no-store' });
            
            if (locRes.ok) {
                const loc = await locRes.json();
                console.log(`[NuMi API] Location resolved: ${loc.city}, ${loc.regionName} (${loc.lat}, ${loc.lon})`);
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
            console.error("[NuMi API] Location/Weather fetch failed", e);
        }

        // 2. Fetch Oura Data using secure env key
        const ouraKey = process.env.OURA_API_KEY;
        let ouraMetrics = null;
        
        if (ouraKey) {
            try {
                const headers = { 'Authorization': `Bearer ${ouraKey.trim()}` };

                const start = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const end = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const tagStart = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const endpoints = [
                    { name: 'sleep', url: `https://api.ouraring.com/v2/usercollection/sleep?start_date=${start}&end_date=${end}` },
                    { name: 'stress', url: `https://api.ouraring.com/v2/usercollection/daily_stress?start_date=${start}&end_date=${end}` },
                    { name: 'activity', url: `https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${start}&end_date=${end}` },
                    { name: 'tag', url: `https://api.ouraring.com/v2/usercollection/tag?start_date=${tagStart}&end_date=${end}` },
                    { name: 'heartrate', url: `https://api.ouraring.com/v2/usercollection/heartrate?start_datetime=${start}T00:00:00Z&end_datetime=${end}T23:59:59Z` },
                    { name: 'readiness', url: `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${start}&end_date=${end}` }
                ];

                const responses = await Promise.all(endpoints.map(ep => fetch(ep.url, { headers })));
                const results: any = {};

                for (let i = 0; i < responses.length; i++) {
                    const res = responses[i];
                    const ep = endpoints[i];
                    if (res.ok) {
                        results[ep.name] = await res.json();
                        console.log(`[NuMi API] Oura ${ep.name} fetch success`);
                    } else {
                        console.warn(`[NuMi API] Oura ${ep.name} fetch failed: ${res.status}`);
                        results[ep.name] = { data: [] };
                    }
                }

                const sleepData = (results.sleep.data || []).reverse().find((d: any) => d.total_sleep_duration);
                const stressData = (results.stress.data || []).reverse().find((d: any) => d.day_summary);
                const activityData = (results.activity.data || []).reverse().find((d: any) => d.score);
                const tagDataArray = (results.tag.data || []).reverse();
                const lastPeriodTag = tagDataArray.find((d: any) => d.tags && d.tags.includes('tag_generic_period'));
                const hrData = (results.heartrate.data || []);
                const readinessData = (results.readiness.data || []).reverse().find((d: any) => d.score);

                let exactHr = null;
                let hrTime = "N/A";
                if(hrData.length > 0) {
                    const sortedHr = hrData.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    exactHr = sortedHr[0].bpm;
                    hrTime = sortedHr[0].timestamp;
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
                    sleepScore: sleepData?.score || 0,
                    sleepDay: sleepData?.day || "N/A",
                    stress: stressRaw.charAt(0).toUpperCase() + stressRaw.slice(1),
                    stressDay: stressData?.day || "N/A",
                    activity: activityData?.score ? activityData.score.toString() : "0",
                    activityDay: activityData?.day || "N/A",
                    cycleDay: cycleDayStr,
                    readinessScore: readinessData?.score || 0,
                    readinessDay: readinessData?.day || "N/A",
                    heartRate: exactHr || 0,
                    heartRateTime: hrTime
                };

                console.log(`[NuMi API] Oura Metrics Debug:`);
                console.log(` - Sleep: ${ouraMetrics.sleep}h (Score: ${ouraMetrics.sleepScore}) for day ${ouraMetrics.sleepDay}`);
                console.log(` - Readiness: ${ouraMetrics.readinessScore} for day ${ouraMetrics.readinessDay}`);
                console.log(` - Heart Rate: ${ouraMetrics.heartRate} bpm at ${ouraMetrics.heartRateTime}`);
                console.log(` - Stress: ${ouraMetrics.stress} for day ${ouraMetrics.stressDay}`);
            } catch(e) {
                console.error("[NuMi API] Oura processing failed", e);
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
