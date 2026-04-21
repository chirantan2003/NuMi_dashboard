import React from 'react';
import { CloudRainWind, MapPin, Sun, Cloud, Droplets } from 'lucide-react';

export default function WeatherLocation({ profile }: any) {
  const isFetched = !!profile?.locationInfo;
  
  return (
    <div className="bg-white rounded-[2rem] p-4 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 flex divide-x divide-gray-100 w-full justify-between items-center h-24">
       {/* Weather */}
       <div className="flex items-center gap-4 w-1/2">
         {isFetched ? (
           <div className="text-orange-500">
             {profile?.weatherInfo?.code > 50 ? <CloudRainWind size={40} className="fill-blue-100 stroke-blue-400" /> : <Sun size={40} className="fill-orange-100 stroke-orange-400" />}
           </div>
         ) : (
           <div className="text-gray-300">
             <CloudRainWind size={40} className="fill-gray-100 stroke-gray-300" />
           </div>
         )}
         <div>
            <h3 className="text-xs text-gray-400">Current Weather</h3>
            <div className={`text-2xl font-semibold leading-tight ${isFetched ? 'text-gray-800' : 'text-gray-300'}`}>{isFetched && profile?.weatherInfo?.temp ? `${profile.weatherInfo.temp}°C` : '--°C'}</div>
         </div>
       </div>

       {/* Location */}
       <div className="flex items-center gap-4 w-1/2 pl-6">
         <div className={`${isFetched ? 'text-orange-400 bg-orange-50' : 'text-gray-300 bg-gray-50'} p-2 rounded-full`}>
            <MapPin size={24} className={isFetched ? 'fill-orange-400 stroke-white' : 'fill-gray-200 stroke-white'} />
         </div>
         <div>
            <h3 className={`text-sm font-semibold uppercase ${isFetched ? 'text-[#204046]' : 'text-gray-400'}`}>{profile?.locationInfo?.city || "Location Unknown"}</h3>
            <p className="text-xs text-gray-400">{profile?.locationInfo?.region || "Enable location access"}</p>
         </div>
       </div>
    </div>
  );
}
