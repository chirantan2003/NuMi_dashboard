'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getUserProfile, getCalendarEvents } from '@/lib/api';

function DashboardLoader() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [calendarData, setCalendarData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!userId) {
        console.warn("NuMi Dashboard: No userId found in URL params.");
        setLoading(false);
        return;
      }
      
      console.log("NuMi Dashboard: Starting data load for userId:", userId);

      try {
        // 1. Fetch Profile and static Calendar data from Firestore first
        console.log("NuMi Dashboard: Fetching base profile from Firestore...");
        const profileInfo = await getUserProfile(userId) || {};
        
        console.log("NuMi Dashboard: Fetching calendar snapshot from Firestore...");
        let calInfo = await getCalendarEvents(userId);
        
        // 2. Attempt Live Calendar sync from port 3000 (CORS required)
        try {
           console.log("NuMi Dashboard: Attempting live calendar fetch from port 3000...");
           const liveCalRes = await fetch(`http://localhost:3000/api/calendar/events?userId=${userId}`, { 
             credentials: 'include',
             // Adding a short timeout specifically for this 3000 fetch so it doesn't hang the whole dashboard
           });
           
           if(liveCalRes.ok) {
               console.log("NuMi Dashboard: Live calendar fetch successful.");
               const liveData = await liveCalRes.json();
               if (liveData && liveData.events) {
                 calInfo = liveData;
               }
           } else {
             console.warn("NuMi Dashboard: Live calendar fetch returned status:", liveCalRes.status);
           }
        } catch(e) {
           console.error("NuMi Dashboard: Live calendar fetch error, falling back to Firestore:", e);
        }
        
        // 3. Fetch Live Oura & Weather Data from local dashboard API
        try {
           console.log("NuMi Dashboard: Fetching external data (Oura/Weather)...");
           const extRes = await fetch('/api/externalData');
           if(extRes.ok) {
              const extData = await extRes.json();
              if(extData.success) {
                 console.log("NuMi Dashboard: External data fetched successfully.");
                 profileInfo.ouraMetrics = extData.oura || profileInfo.ouraMetrics || null;
                 profileInfo.weatherInfo = extData.weather || null;
                 profileInfo.locationInfo = extData.location || null;
              }
           } else {
             console.warn("NuMi Dashboard: External data fetch returned status:", extRes.status);
           }
        } catch(e) {
          console.error("NuMi Dashboard: External data fetch failed:", e);
        }
        
        setProfileData(profileInfo);
        setCalendarData(calInfo);
      } catch (globalError) {
        console.error("NuMi Dashboard: Critical error during data load:", globalError);
      } finally {
        console.log("NuMi Dashboard: Data load sequence finished.");
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#eaf0f4] text-gray-800">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <h1 className="text-xl font-medium mb-2">No User ID Provided</h1>
          <p className="text-gray-500">Please provide a ?userId= parameter in the URL</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#eaf0f4]">
        <div className="flex flex-col items-center gap-4 text-teal-600">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Loading your NuMi Dashboard...</p>
        </div>
      </div>
    );
  }

  return <DashboardLayout profile={profileData} calendar={calendarData} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eaf0f4]" />}>
      <DashboardLoader />
    </Suspense>
  );
}
