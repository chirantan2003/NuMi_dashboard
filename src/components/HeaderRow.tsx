import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

export default function HeaderRow({ profile }: any) {
  const today = new Date();
  
  return (
    <div className="flex justify-between items-center w-full mb-8">
      {/* Brand */}
      <div className="text-[#3c5d62] text-4xl font-serif tracking-tight pr-12">
        NuMI
      </div>

      {/* Date Pills */}
      <div className="flex items-center space-x-3 bg-gray-100/50 rounded-full p-1 border border-white/60 shadow-sm backdrop-blur-md overflow-hidden">
        <div className="px-6 py-2 text-sm text-gray-400 font-medium whitespace-nowrap">{format(subDays(today, 1), "EEEE, do MMMM")}</div>
        <div className="px-6 py-2 bg-[#204046] text-white rounded-full text-sm font-medium shadow-md whitespace-nowrap">{format(today, "EEEE, do MMMM")}</div>
        <div className="px-6 py-2 text-sm text-gray-400 font-medium whitespace-nowrap">{format(addDays(today, 1), "EEEE, do MMMM")}</div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-4 pl-12 flex-shrink-0">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-black/5 shadow-sm">
           <Target size={18} className="text-[#7d9b62]" />
           <CheckCircle2 size={18} className="text-[#c7d9a1] bg-[#eef3db] rounded-full" />
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
            {profile?.googleAvatar ? (
               <img src={profile.googleAvatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
               <img src={`https://ui-avatars.com/api/?name=${profile?.name || 'User'}&background=random`} alt="avatar" className="w-full h-full object-cover" />
            )}
        </div>
      </div>
    </div>
  );
}
