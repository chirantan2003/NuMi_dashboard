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
        setLoading(false);
        return;
      }
      
      const profileInfo = await getUserProfile(userId) || {};
      
      // Attempt to hit the explicit localhost:3000 backend to securely utilize NextAuth tokens natively over CORS
      let calInfo: any = null;
      try {
         const liveCalRes = await fetch(`http://localhost:3000/api/calendar/events?userId=${userId}`, { credentials: 'include' });
         if(liveCalRes.ok) {
             calInfo = await liveCalRes.json();
         } else {
             calInfo = await getCalendarEvents(userId); // Fallback to firebase snapshot!
         }
      } catch(e) {
         calInfo = await getCalendarEvents(userId); // Fallback to firebase snapshot!
      }
      
      // Fetch Live Oura & Weather Data 
      try {
         const extRes = await fetch('/api/externalData');
         if(extRes.ok) {
            const extData = await extRes.json();
            if(extData.success) {
               profileInfo.ouraMetrics = extData.oura || null;
               profileInfo.weatherInfo = extData.weather || null;
               profileInfo.locationInfo = extData.location || null;
            }
         }
      } catch(e) {}
      
      setProfileData(profileInfo);
      setCalendarData(calInfo);
      setLoading(false);
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
        <div className="animate-pulse flex items-center space-x-4 text-teal-600">
          Loading your NuMi Dashboard...
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
