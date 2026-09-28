'use client';

import React from 'react';
import { Sparkles, Snowflake, Clock, ArrowRight, ShieldCheck, Zap, MapPin } from 'lucide-react';
import { RoomSchedule, DayOfWeek, PERIOD_TIMINGS, getConsecutiveFreePeriods } from '@/data/roomData';

interface QuickRecommendationProps {
  rooms: RoomSchedule[];
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onSelectRoom: (room: RoomSchedule) => void;
}

export const QuickRecommendation: React.FC<QuickRecommendationProps> = ({
  rooms,
  selectedDay,
  selectedPeriod,
  onSelectRoom,
}) => {
  const periodIndex = selectedPeriod - 1;

  // Score rooms: +100 for AC, + 20 per consecutive free period
  const freeRooms = rooms
    .filter(r => (r.occupied[selectedDay]?.[periodIndex] ?? 1) === 0)
    .map(r => {
      const consecutive = getConsecutiveFreePeriods(r, selectedDay, periodIndex);
      const score = (r.isAC ? 100 : 20) + consecutive * 25;
      return { room: r, consecutive, score };
    })
    .sort((a, b) => b.score - a.score);

  if (freeRooms.length === 0) {
    return (
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-200 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">All 10 Monitored Rooms Are Currently Occupied</h2>
            <p className="text-xs text-slate-600">
              Classes are actively in session for Period {selectedPeriod}. Try switching periods or checking the upcoming timetable below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const topPick = freeRooms[0];
  const endPeriodIndex = periodIndex + topPick.consecutive - 1;
  const startTiming = PERIOD_TIMINGS[periodIndex];
  const endTiming = PERIOD_TIMINGS[Math.min(endPeriodIndex, PERIOD_TIMINGS.length - 1)];

  return (
    <div className="mb-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 shadow-xl shadow-teal-700/15">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Campus Best Pick &bull; Free Right Now</span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {topPick.room.room}
            </h2>
            <span className="text-sm sm:text-base font-semibold text-teal-100 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-cyan-200" />
              {topPick.room.floor}
            </span>
            {topPick.room.isAC && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-400/25 border border-cyan-300/40 text-xs font-bold text-cyan-100">
                <Snowflake className="w-3.5 h-3.5 text-cyan-200" />
                Air Conditioned
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-teal-50/90 max-w-2xl leading-relaxed">
            Free for the next <strong className="text-white underline decoration-amber-300 decoration-2">{topPick.consecutive} consecutive periods</strong> (from {startTiming.startTime} to {endTiming.endTime}). Perfect for uninterrupted study or group project work!
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => onSelectRoom(topPick.room)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-teal-800 font-bold text-sm shadow-md hover:bg-teal-50 active:scale-95 transition-all cursor-pointer"
          >
            <span>Inspect Full Schedule</span>
            <ArrowRight className="w-4 h-4 text-teal-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
