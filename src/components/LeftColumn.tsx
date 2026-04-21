import React from 'react';
import { Calendar, Cloud, Activity, Heart, Moon, AlertCircle, Wind, Droplets } from 'lucide-react';

export default function LeftColumn({ profile, oura, medications }: any) {
  // Extract connected apps
  const connectedAppsMap = profile?.connectedApps || {};
  const activeApps = Object.keys(connectedAppsMap).filter(k => connectedAppsMap[k]);
  
  const appLinks: Record<string, string> = {
      doordash: "https://www.doordash.com",
      google: "https://calendar.google.com",
      calendar: "https://calendar.google.com",
      oura: "https://cloud.ouraring.com",
      maps: "https://timeline.google.com",
      weather: "https://weather.com"
  };
  
  // Extract daily log or tasks
  const dailyKeyTasks = profile?.dailyLog?.keyTasks || "";
  const goalsArray = profile?.health?.goals || [];

  return (
    <div className="flex flex-col gap-8">
      
      {/* Apps Integrated */}
      <div>
        <h2 className="text-[#3c5d62] text-xl font-serif mb-4">Apps Integrated</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <button className="w-12 h-12 rounded-full bg-[#364951] text-white flex items-center justify-center text-2xl pb-1 hover:opacity-80 transition">+</button>
          
          {activeApps.length === 0 && <span className="text-gray-400 text-sm italic">No apps connected</span>}
          {activeApps.map((appId) => (
             <a key={appId} href={appLinks[appId] || "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-2 hover:scale-110 transition-transform">
                 <img src={`/${appId}.png`} alt={appId} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = `<span class="text-xs font-bold text-gray-500">${appId.substring(0,3).toUpperCase()}</span>` }} />
             </a>
          ))}
        </div>
      </div>

      {/* Medication Log */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-white/40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#3c5d62] text-xl font-serif">Medication/Supplement Log</h2>
          <button className="bg-[#f09a47] text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 flex items-center gap-1 shadow-sm">
            <span>+</span> Quick Add
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {medications?.length > 0 ? (
            medications.map((med: any, i: number) => (
              <div key={i} className="bg-[#b3cbd1] text-[#2c474b] px-4 py-2 rounded-full text-sm flex items-center gap-2 font-medium">
                <span className="opacity-50">💊</span> {typeof med === 'string' ? med : `${med.name} ${med.mg}MG`}
              </div>
            ))
          ) : (
             <div className="text-gray-500 text-sm italic">No medications logged.</div>
          )}
        </div>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep Card */}
        <div className="bg-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-36 border border-white/60 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.05)]">
           <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-100 to-transparent blur-2xl rounded-full -translate-x-6 -translate-y-6"></div>
           <div className="flex justify-between items-start z-10 relative">
             <div className="bg-blue-50 p-2 rounded-full text-blue-500">
               <Moon size={20} />
             </div>
             <div className="text-right">
               <h3 className="text-[#204046] font-serif text-lg flex items-center gap-1 justify-end">Sleep <span className="text-gray-400">›</span></h3>
               <p className="text-xs text-yaml font-medium">{oura?.sleep?.score > 80 ? '👑 Optimal' : ''}</p>
             </div>
           </div>
           <div className="flex items-end justify-between mt-4 z-10 relative">
             <span className="text-4xl text-[#204046] font-light">{oura?.sleep || '--'}</span>
             <div className="w-1/2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                   <div className="h-full bg-[#1b3d42] rounded-full" style={{ width: `${Math.min(100, Math.max(0, (parseInt(oura?.sleep) || 0) / 10 * 100))}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>h</span><span>10h+</span>
                </div>
             </div>
           </div>
        </div>

        {/* Activity Goal */}
        <div className="bg-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-36 border border-white/60 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.05)]">
           <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent blur-2xl rounded-full -translate-x-6 -translate-y-6"></div>
           <div className="flex justify-between items-start z-10 relative">
             <div className="bg-blue-50 p-2 rounded-full text-blue-500">
               <Activity size={20} />
             </div>
             <div className="text-right">
               <h3 className="text-[#204046] font-serif text-lg flex items-center gap-1 justify-end">Activity goal <span className="text-gray-400">›</span></h3>
             </div>
           </div>
           <div className="flex items-end justify-between mt-4 z-10 relative">
             <span className="text-4xl text-[#204046] font-light">{oura?.activity?.score || oura?.activity || '--'}<span className="text-2xl">%</span></span>
             <div className="w-1/2">
                <div className="text-[10px] text-right text-[#204046] mb-1">Active Cal</div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden relative">
                   <div className="h-full bg-[#1b3d42] rounded-full" style={{ width: `${oura?.activity?.score || oura?.activity || 0}%` }}></div>
                </div>
             </div>
           </div>
        </div>

        {/* Stress */}
        <div className="bg-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-36 border border-white/60 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.05)]">
           <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-orange-50 to-transparent blur-2xl rounded-full -translate-x-6 -translate-y-6"></div>
           <div className="flex justify-between items-start z-10 relative">
             <div className="bg-blue-50 p-2 rounded-full text-blue-400">
               <Wind size={20} />
             </div>
             <div className="text-right">
               <h3 className="text-[#204046] font-serif text-lg flex items-center gap-1 justify-end">Stress <span className="text-gray-400">›</span></h3>
               <p className="text-xs text-orange-500 font-medium">{oura?.stress}</p>
             </div>
           </div>
           <div className="mt-8 z-10 relative">
              <div className="h-2 w-full bg-gradient-to-r from-blue-200 via-gray-200 to-[#204046] rounded-full"></div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                <span>Restorative day</span><span>Stressful day</span>
              </div>
           </div>
        </div>

        {/* Cycle Day */}
        <div className="bg-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-36 border border-white/60 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.05)]">
           <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent blur-2xl rounded-full -translate-x-6 -translate-y-6"></div>
           <div className="flex justify-between items-start z-10 relative">
             <div className="bg-purple-50 p-2 rounded-full text-purple-400">
               <Droplets size={20} />
             </div>
             <div className="text-right">
               <h3 className="text-[#204046] font-serif text-lg flex items-center gap-1 justify-end">Cycle Day <span className="text-gray-400">›</span></h3>
             </div>
           </div>
           <div className="flex items-end justify-between mt-4 z-10 relative">
             <span className="text-4xl text-[#204046] font-light">{oura?.cycleDay || 'N/A'}</span>
           </div>
        </div>

        {/* Heart Rate */}
        <div className="bg-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-36 border border-white/60 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.05)]">
           <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent blur-2xl rounded-full -translate-x-6 -translate-y-6"></div>
           <div className="flex justify-between items-start z-10 relative">
             <div className="bg-blue-50 p-2 rounded-full text-blue-400">
               <Heart size={20} />
             </div>
             <div className="text-right">
               <h3 className="text-[#204046] font-serif text-lg flex items-center gap-1 justify-end">Heart Rate <span className="text-gray-400">›</span></h3>
             </div>
           </div>
           <div className="flex items-end mt-4 z-10 relative gap-1">
             <span className="text-4xl text-[#204046] font-light pr-2">
                 {oura?.heartRate || '--'}
             </span>
             <span className="text-sm text-gray-500 mb-1">bmp</span>
           </div>
        </div>

        {/* Readiness */}
        <div className="bg-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-36 border border-white/60 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.05)]">
           <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-100 to-transparent blur-2xl rounded-full -translate-x-6 -translate-y-6"></div>
           <div className="flex justify-between items-start z-10 relative">
             <div className="bg-green-50 p-2 rounded-full text-green-500">
               <Activity size={20} />
             </div>
             <div className="text-right">
               <h3 className="text-[#204046] font-serif text-lg flex items-center gap-1 justify-end">Readiness <span className="text-gray-400">›</span></h3>
             </div>
           </div>
           <div className="flex items-end justify-between mt-4 z-10 relative">
             <span className="text-4xl text-[#204046] font-light">{oura?.readinessScore || '--'}</span>
             <div className="w-1/2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                   <div className="h-full bg-[#1b3d42] rounded-full" style={{ width: `${oura?.readinessScore || 0}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>66</span><span>88</span>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Dynamic Key Tasks or Goals Log */}
      <div className="bg-white rounded-3xl p-6 mt-4 shadow-sm border border-white/60">
        <h2 className="text-[#204046] text-lg font-serif mb-4 flex justify-between items-center">
            Log specific notes / tasks
        </h2>
        {dailyKeyTasks ? (
            <div className="w-full bg-[#f4f7f8] rounded-2xl p-4 text-gray-700 min-h-[5rem] whitespace-pre-wrap">{dailyKeyTasks}</div>
        ) : (
            <textarea 
               className="w-full bg-[#f4f7f8] rounded-2xl h-24 p-4 resize-none focus:outline-none focus:ring-1 focus:ring-[#204046]/30 text-gray-700" 
               placeholder="Add personal goals or important events for the week"
            ></textarea>
        )}
      </div>

    </div>
  );
}
