'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Snowflake, 
  Clock, 
  MapPin, 
  Sparkles, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { RoomSchedule, DayOfWeek, PERIOD_TIMINGS, getConsecutiveFreePeriods } from '@/data/roomData';

interface FreeRoomsShowcaseProps {
  rooms: RoomSchedule[];
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onlyFreeFilter: boolean;
  setOnlyFreeFilter: (val: boolean) => void;
  onSelectRoom: (room: RoomSchedule) => void;
}

export const FreeRoomsShowcase: React.FC<FreeRoomsShowcaseProps> = ({
  rooms,
  selectedDay,
  selectedPeriod,
  onlyFreeFilter,
  setOnlyFreeFilter,
  onSelectRoom,
}) => {
  const periodIndex = selectedPeriod - 1;
  const currentTiming = PERIOD_TIMINGS[periodIndex];

  // Filter only free rooms at currently selected period
  const freeRooms = rooms
    .filter(r => (r.occupied[selectedDay]?.[periodIndex] ?? 1) === 0)
    .map(r => {
      const consecutive = getConsecutiveFreePeriods(r, selectedDay, periodIndex);
      const endIdx = periodIndex + consecutive - 1;
      const endTiming = PERIOD_TIMINGS[Math.min(endIdx, PERIOD_TIMINGS.length - 1)];
      return {
        room: r,
        consecutive,
        endTime: endTiming.endTime,
      };
    })
    .sort((a, b) => {
      // Prioritize AC then longest consecutive
      if (a.room.isAC && !b.room.isAC) return -1;
      if (!a.room.isAC && b.room.isAC) return 1;
      return b.consecutive - a.consecutive;
    });

  const totalACFree = freeRooms.filter(f => f.room.isAC).length;

  return (
    <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-7 shadow-2xl border border-emerald-500/20">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Live Campus Room Radar &bull; {selectedDay}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3 flex-wrap">
            <span>
              {freeRooms.length > 0 ? (
                <>
                  <span className="text-emerald-400">{freeRooms.length} of {rooms.length}</span> Classrooms Free Right Now
                </>
              ) : (
                'All 10 Classrooms Occupied This Period'
              )}
            </span>
            <span className="text-sm font-semibold text-slate-300 bg-white/10 px-3 py-1 rounded-xl backdrop-blur-xs">
              Period {selectedPeriod} ({currentTiming.startTime} - {currentTiming.endTime})
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {freeRooms.length > 0
              ? `${totalACFree} AC classrooms available with power outlets & Wi-Fi. Click any room card below to reserve or inspect full schedule.`
              : 'All monitored rooms have active lectures or lab sessions. Try switching periods or checking the AI recommendations.'}
          </p>
        </div>

        {/* 1-Click Filter: Only Show Free Rooms */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setOnlyFreeFilter(!onlyFreeFilter)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-md ${
              onlyFreeFilter
                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 font-black'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
            }`}
          >
            <Filter className="w-4 h-4 text-emerald-300" />
            <span>{onlyFreeFilter ? 'Showing ONLY Free Rooms' : 'Filter: Show ONLY Free Rooms'}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${onlyFreeFilter ? 'bg-slate-900 text-white' : 'bg-emerald-400/20 text-emerald-300'}`}>
              {freeRooms.length}
            </span>
          </button>
        </div>
      </div>

      {/* Free Rooms Horizontal Carousel Cards */}
      {freeRooms.length > 0 && (
        <div className="relative z-10 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {freeRooms.map(({ room, consecutive, endTime }) => (
              <div
                key={room.room}
                onClick={() => onSelectRoom(room)}
                className="group relative rounded-2xl bg-white/10 hover:bg-white/15 border border-emerald-400/30 hover:border-emerald-400 p-4 transition-all duration-200 cursor-pointer backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                        {room.room}
                      </h4>
                      <span className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {room.floor}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 shadow-2xs">
                        VACANT
                      </span>
                      {room.isAC && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cyan-200">
                          <Snowflake className="w-2.5 h-2.5 text-cyan-300" />
                          AC
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-black/25 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        Free for {consecutive} {consecutive === 1 ? 'Period' : 'Periods'}
                      </span>
                      <span className="text-[11px] text-slate-300">Until {endTime}</span>
                    </div>
                    {/* Visual progress bar of 9 periods */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden flex gap-0.5 mt-1.5">
                      {Array.from({ length: 9 }).map((_, i) => {
                        const isFreeSlot = room.occupied[selectedDay]?.[i] === 0;
                        const isCurrentSlot = i === periodIndex;
                        return (
                          <div
                            key={i}
                            className={`flex-1 h-full rounded-xs ${
                              isCurrentSlot
                                ? 'bg-amber-400'
                                : isFreeSlot
                                ? 'bg-emerald-400'
                                : 'bg-slate-700'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-300 font-semibold">
                  <span>View 5-Day Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
