import React from 'react';
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';
import HeaderRow from './HeaderRow';
import WeatherLocation from './WeatherLocation';

interface DashboardLayoutProps {
  profile: any;
  calendar: any;
}

export default function DashboardLayout({ profile, calendar }: DashboardLayoutProps) {
  // Safe extraction of profile data
  const name = profile?.name || 'User';
  const oura = profile?.ouraMetrics || {};
  const medications = profile?.health?.medications || [];
  
  // Safe extraction of calendar data
  const events = calendar?.events || [];

  return (
    <div className="min-h-screen bg-[#edf3f6] font-sans p-4 sm:p-8 flex justify-center text-[#2d4b4e] overflow-x-hidden">
      <div className="max-w-[1400px] w-full flex flex-col pt-4">
        
        <HeaderRow profile={profile} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Content Area */}
          <div className="flex flex-col">
            <LeftColumn profile={profile} oura={oura} medications={medications} />
          </div>

          {/* Right Sidebar Area */}
          <div className="flex flex-col gap-6">
            <WeatherLocation profile={profile} />
            <div className="bg-[#5a7b80] rounded-[2rem] p-8 pb-12 text-white relative shadow-xl flex flex-col gap-8 flex-1">
              <RightColumn events={events} profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
