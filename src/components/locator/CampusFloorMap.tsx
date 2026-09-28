'use client';

import React from 'react';
import { 
  Building2, 
  DoorOpen, 
  Snowflake, 
  Wind, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Clock, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { RoomSchedule, DayOfWeek, PERIOD_TIMINGS, getConsecutiveFreePeriods, getNextFreePeriodIndex } from '@/data/roomData';

interface CampusFloorMapProps {
  rooms: RoomSchedule[];
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onSelectRoom: (room: RoomSchedule) => void;
}

export const CampusFloorMap: React.FC<CampusFloorMapProps> = ({
  rooms,
  selectedDay,
  selectedPeriod,
  onSelectRoom,
}) => {
  const periodIndex = selectedPeriod - 1;

  // Levels ordered from top to bottom (7th Floor down to Ground Floor)
  const floorLevels = [
    { name: '7th Floor', label: 'LEVEL 7' },
    { name: '6th Floor', label: 'LEVEL 6' },
    { name: '5th Floor', label: 'LEVEL 5' },
    { name: '4th Floor', label: 'LEVEL 4' },
    { name: '2nd Floor', label: 'LEVEL 2' },
    { name: 'Ground Floor', label: 'LEVEL 0' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus Architectural View</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Campus Floor-by-Floor Door Map &bull; {selectedDay}
          </h3>
          <p className="text-xs text-slate-500">
            Interactive building elevation model showing real-time door sensors and room availability.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Door Open / Free
          </span>
          <span className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Door Closed / Class Active
          </span>
        </div>
      </div>

      {/* Building Level Cross Section */}
      <div className="space-y-4">
        {floorLevels.map(lvl => {
          const floorRooms = rooms.filter(r => r.floor === lvl.name);
          if (floorRooms.length === 0) return null;

          const freeInFloor = floorRooms.filter(r => (r.occupied[selectedDay]?.[periodIndex] ?? 1) === 0);
          const hasFree = freeInFloor.length > 0;

          return (
            <div
              key={lvl.name}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                hasFree
                  ? 'bg-gradient-to-r from-emerald-50/50 via-slate-50/80 to-white border-emerald-200/80 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              {/* Floor Label & Stats */}
              <div className="flex items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-white">
                    {lvl.label}
                  </span>
                  <h4 className="text-sm font-black text-slate-900">{lvl.name}</h4>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    hasFree
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {freeInFloor.length} of {floorRooms.length} Available
                </span>
              </div>

              {/* Classroom Doors on this floor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {floorRooms.map(room => {
                  const isFree = (room.occupied[selectedDay]?.[periodIndex] ?? 1) === 0;
                  const consecutive = isFree ? getConsecutiveFreePeriods(room, selectedDay, periodIndex) : 0;
                  const nextFree = !isFree ? getNextFreePeriodIndex(room, selectedDay, periodIndex) : -1;

                  return (
                    <div
                      key={room.room}
                      onClick={() => onSelectRoom(room)}
                      className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isFree
                          ? 'bg-white hover:bg-emerald-50/40 border-emerald-300 hover:border-emerald-500 shadow-2xs hover:shadow-xs'
                          : 'bg-white/80 hover:bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Door Indicator */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold relative ${
                            isFree
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <DoorOpen className="w-5 h-5" />
                          <span
                            className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              isFree ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {room.room}
                            </span>
                            {room.isAC && (
                              <span className="p-0.5 rounded-md bg-cyan-50 text-cyan-700" title="AC">
                                <Snowflake className="w-3 h-3 text-cyan-600" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-500">
                            {isFree ? (
                              <span className="text-emerald-700 font-semibold">
                                Free for {consecutive} {consecutive === 1 ? 'Period' : 'Periods'}
                              </span>
                            ) : (
                              <span>
                                {nextFree !== -1
                                  ? `Next free: P${nextFree + 1}`
                                  : 'Occupied today'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
