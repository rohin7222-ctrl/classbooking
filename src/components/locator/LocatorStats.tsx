'use client';

import React from 'react';
import { DoorOpen, Snowflake, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { RoomSchedule, DayOfWeek, getConsecutiveFreePeriods } from '@/data/roomData';

interface LocatorStatsProps {
  rooms: RoomSchedule[];
  selectedDay: DayOfWeek;
  selectedPeriod: number;
}

export const LocatorStats: React.FC<LocatorStatsProps> = ({ rooms, selectedDay, selectedPeriod }) => {
  const periodIndex = selectedPeriod - 1;

  const freeRooms = rooms.filter(r => (r.occupied[selectedDay]?.[periodIndex] ?? 1) === 0);
  const occupiedRooms = rooms.filter(r => (r.occupied[selectedDay]?.[periodIndex] ?? 1) === 1);
  const acFreeRooms = freeRooms.filter(r => r.isAC);
  const totalACRooms = rooms.filter(r => r.isAC).length;

  // Find room with longest consecutive free periods starting from selectedPeriod
  let maxConsecutive = 0;
  let bestRoomName = '';
  rooms.forEach(r => {
    const cons = getConsecutiveFreePeriods(r, selectedDay, periodIndex);
    if (cons > maxConsecutive) {
      maxConsecutive = cons;
      bestRoomName = r.room;
    }
  });

  const freePercentage = Math.round((freeRooms.length / rooms.length) * 100);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* 1. Free Rooms Now */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Free This Period</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{freeRooms.length}</span>
          <span className="text-xs text-slate-500 font-medium">/ {rooms.length} rooms ({freePercentage}%)</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${freePercentage}%` }}
          />
        </div>
      </div>

      {/* 2. AC Rooms Free */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Free AC Rooms</span>
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <Snowflake className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-cyan-700">{acFreeRooms.length}</span>
          <span className="text-xs text-slate-500 font-medium">/ {totalACRooms} AC rooms</span>
        </div>
        <p className="mt-2 text-[11px] text-cyan-600/90 font-medium truncate">
          {acFreeRooms.length > 0 ? `${acFreeRooms.map(r => r.room).slice(0, 2).join(', ')}${acFreeRooms.length > 2 ? '...' : ''}` : 'No AC rooms free right now'}
        </p>
      </div>

      {/* 3. Longest Free Window */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Max Free Window</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-indigo-700">
            {maxConsecutive > 0 ? `${maxConsecutive} Per.` : '0 Per.'}
          </span>
          <span className="text-xs text-slate-500 font-medium">unbroken</span>
        </div>
        <p className="mt-2 text-[11px] text-indigo-600 font-medium truncate">
          {bestRoomName ? `In ${bestRoomName} starting now` : 'All occupied'}
        </p>
      </div>

      {/* 4. Occupied Rooms */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Occupied Rooms</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-rose-600">{occupiedRooms.length}</span>
          <span className="text-xs text-slate-500 font-medium">classes in session</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-rose-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round((occupiedRooms.length / rooms.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
