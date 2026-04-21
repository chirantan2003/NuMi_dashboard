import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Briefcase } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addDays } from 'date-fns';

export default function RightColumn({ events, profile }: any) {
  // Use real events data, default to empty to enforce UI dynamism
  const mappedEvents = events?.length > 0 ? events : [];
  
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const sortedEvents = [...mappedEvents].filter(ev => ev.start).sort((a: any, b: any) => {
      try { return new Date(a.start).getTime() - new Date(b.start).getTime(); } catch(e) { return 0; }
  });
  
  // Today Events: strictly today IF they exist today, ELSE grab the first 5 chronologically
  let todayEvents = sortedEvents.filter((ev: any) => {
      try { return isSameDay(parseISO(ev.start), today); } catch(e) { return false; }
  });
  
  let upcomingEvents = sortedEvents.filter((ev: any) => {
      try { return new Date(ev.start) > today && !isSameDay(parseISO(ev.start), today); } catch(e) { return false; }
  });
  
  // RELAXATION: if no events exist strictly today, just show the earliest 5 events as the timeline!
  if (todayEvents.length === 0 && sortedEvents.length > 0) {
      todayEvents = sortedEvents.slice(0, 5);
      upcomingEvents = sortedEvents.slice(5);
  }

  return (
    <>
      <h2 className="text-2xl font-serif">Calendar</h2>
      
      {/* Dynamic Calendar Widget */}
      <div className="rounded-[1.5rem] bg-[#67898f]/50 border border-white/20 p-5 mt-2">
        <div className="flex justify-between items-center mb-6">
           <span className="font-semibold text-lg flex items-center gap-2">{format(today, "MMMM yyyy")} <ChevronRight size={16} className="opacity-50" /></span>
           <div className="flex gap-2 text-white/50">
              <ChevronLeft size={20} />
              <ChevronRight size={20} />
           </div>
        </div>
        
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm font-medium">
           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
             <div key={d} className="text-xs text-white/60 mb-2">{d}</div>
           ))}
           
           {calendarDays.map((day, idx) => {
               const isCurrentMonth = isSameMonth(day, monthStart);
               const isTodayDate = isSameDay(day, today);
               
               if(isTodayDate) {
                  return <div key={idx} className="bg-[#f09a47] text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto shadow-sm">{format(day, 'd')}</div>
               }
               return <div key={idx} className={isCurrentMonth ? "" : "opacity-40"}>{format(day, 'd')}</div>
           })}
        </div>
      </div>

      <div className="mt-4">
         <h2 className="text-xl font-serif">Key Events For Today</h2>
         <p className="text-sm mt-1 mb-4">{format(today, "EEEE, MMMM d, yyyy")}</p>
         
         {/* Actionable insight logic */}
         {profile?.dailyLog?.keyTasks && (
             <div className="bg-white text-gray-800 rounded-2xl p-4 mb-6 shadow-sm relative">
                <div className="absolute top-4 left-4 text-[#204046]"><Sparkles size={16} /></div>
                <h4 className="font-semibold text-sm ml-7 mb-1 text-[#204046]">Profile Note</h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {profile.dailyLog.keyTasks}
                </p>
             </div>
         )}

         {/* Events Timeline */}
         <div className="relative border-l border-white/20 ml-6 pl-6 space-y-4 mb-8">
            <div className="absolute -left-10 top-0 text-[10px] text-white/70 text-right w-8 leading-tight">
               Soon
            </div>
            {todayEvents.length === 0 && (
                <div className="text-white/70 flex items-center gap-2 mt-4 text-sm"><CheckCircle2 size={16} /> No events mapped.</div>
            )}
            {todayEvents.slice(0, 5).map((ev: any, i: number) => {
               let timeStr = "All Day";
               if(ev.start && !ev.start.includes("00:00:00+")) {
                   try {
                     timeStr = format(parseISO(ev.start), "h:mm a") + " - " + format(parseISO(ev.end), "h:mm a");
                   } catch(e) {}
               }

               return (
                 <div key={i} className="bg-[#ebf1f0] text-gray-800 rounded-full p-2 pr-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f09a47] flex items-center justify-center text-white shrink-0">
                       <Briefcase size={16} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-semibold">{ev.title || "No Title"}</h4>
                      <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                         {ev.start && format(parseISO(ev.start), "MMM d, h:mm a")}
                      </p>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>

      <div className="mt-auto pb-4">
         <h2 className="text-xl font-serif">Upcoming Important Events</h2>
         <p className="text-sm mt-1 mb-4">Future Events</p>
         
         <div className="relative border-l border-white/20 ml-6 pl-6 pt-2 space-y-4">
            <div className="absolute -left-10 top-2 text-[10px] text-white/70 text-right w-8 leading-tight">
               Soon
            </div>
            
            {upcomingEvents.length === 0 && (
                <div className="text-white/70 flex items-center gap-2 mt-4 text-sm"><CheckCircle2 size={16} /> No upcoming scheduled events.</div>
            )}
            
            {upcomingEvents.slice(0, 3).map((ev: any, i: number) => {
               let whenStr = "Upcoming";
               if(ev.start) {
                   try {
                     whenStr = format(parseISO(ev.start), "MMM d, h:mm a");
                   } catch(e) {}
               }

               return (
                 <div key={i} className="bg-[#fcf5eb] text-gray-800 rounded-full p-2 pr-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f09a47] flex items-center justify-center text-white shrink-0">
                        <Briefcase size={16} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-semibold">{ev.title || "No Title"}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{whenStr}</p>
                    </div>
                 </div>
               );
             })}
         </div>
      </div>
    </>
  );
}
