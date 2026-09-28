'use client';

import React from 'react';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { RoomSchedule, DayOfWeek } from '@/data/roomData';
import { RoomCard } from './RoomCard';

interface FloorGroupedViewProps {
  rooms: RoomSchedule[];
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onSelectPeriod: (p: number) => void;
  onOpenDetails: (room: RoomSchedule) => void;
}

export const FloorGroupedView: React.FC<FloorGroupedViewProps> = ({
  rooms,
  selectedDay,
  selectedPeriod,
  onSelectPeriod,
  onOpenDetails,
}) => {
  const periodIndex = selectedPeriod - 1;

  // Custom ordering for floors: Ground Floor, 2nd Floor, 4th Floor, 5th Floor, 6th Floor, 7th Floor
  const floorOrder = ['Ground Floor', '2nd Floor', '4th Floor', '5th Floor', '6th Floor', '7th Floor'];

  const floorsMap = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<string, RoomSchedule[]>);

  const sortedFloors = Object.keys(floorsMap).sort((a, b) => {
    const idxA = floorOrder.indexOf(a);
    const idxB = floorOrder.indexOf(b);
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  return (
    <div className="space-y-8">
      {sortedFloors.map(floorName => {
        const floorRooms = floorsMap[floorName];
        const freeInFloor = floorRooms.filter(r => (r.occupied[selectedDay]?.[periodIndex] ?? 1) === 0);

        return (
          <div key={floorName} className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-200/80">
            {/* Floor Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs text-emerald-700 flex items-center justify-center font-black">
                  <Layers className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{floorName}</h3>
                  <p className="text-xs text-slate-500">
                    {floorRooms.length} monitored {floorRooms.length === 1 ? 'room' : 'rooms'} on this level
                  </p>
                </div>
              </div>

              {/* Floor Availability Badge */}
              <div className="flex items-center gap-2">
                {freeInFloor.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{freeInFloor.length} of {floorRooms.length} Free</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>All Occupied</span>
                  </span>
                )}
              </div>
            </div>

            {/* Room Cards in this Floor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {floorRooms.map(room => (
                <RoomCard
                  key={room.room}
                  room={room}
                  selectedDay={selectedDay}
                  selectedPeriod={selectedPeriod}
                  onSelectPeriod={onSelectPeriod}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
