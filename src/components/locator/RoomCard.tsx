'use client';

import React, { useState } from 'react';
import { 
  Snowflake, 
  Wind, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Wifi, 
  Monitor, 
  Zap,
  CalendarCheck
} from 'lucide-react';
import { 
  RoomSchedule, 
  DayOfWeek, 
  PERIOD_TIMINGS, 
  getConsecutiveFreePeriods, 
  getNextFreePeriodIndex, 
  getTotalFreePeriods 
} from '@/data/roomData';

interface RoomCardProps {
  room: RoomSchedule;
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onSelectPeriod: (p: number) => void;
  onOpenDetails: (room: RoomSchedule) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  selectedDay,
  selectedPeriod,
  onSelectPeriod,
  onOpenDetails,
}) => {
  const periodIndex = selectedPeriod - 1;
  const schedule = room.occupied[selectedDay] || [];
  const isFree = (schedule[periodIndex] ?? 1) === 0;

  // Calculate consecutive free periods from currently selected period
  const consecutiveFree = isFree ? getConsecutiveFreePeriods(room, selectedDay, periodIndex) : 0;
  const nextFreePeriodIndex = !isFree ? getNextFreePeriodIndex(room, selectedDay, periodIndex) : -1;
  const totalFreeToday = getTotalFreePeriods(room, selectedDay);

  const [hoveredPeriod, setHoveredPeriod] = useState<number | null>(null);

  // Time details for consecutive free window
  const endPeriodIndex = periodIndex + consecutiveFree - 1;
  const currentTiming = PERIOD_TIMINGS[periodIndex];
  const endTiming = PERIOD_TIMINGS[Math.min(endPeriodIndex, PERIOD_TIMINGS.length - 1)];

  return (
    <div
      className={`group relative rounded-3xl bg-white border p-5 transition-all duration-300 flex flex-col justify-between hover:shadow-lg ${
        isFree
          ? 'border-emerald-200/80 hover:border-emerald-400 hover:shadow-emerald-500/5'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-slate-500/5 opacity-90 hover:opacity-100'
      }`}
    >
      <div>
        {/* Header: Room Name, Floor & AC Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                {room.room}
              </h3>
              {room.isAC ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 border border-cyan-200 text-[11px] font-bold text-cyan-700">
                  <Snowflake className="w-3 h-3 text-cyan-500" />
                  AC
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-500">
                  <Wind className="w-3 h-3 text-slate-400" />
                  Non-AC
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{room.floor}</span>
              <span className="text-slate-300">&bull;</span>
              <span>{room.room.includes('Lab') ? 'Specialized Lab' : 'Standard Lecture Hall'}</span>
            </div>
          </div>

          {/* Availability Status Badge */}
          <div>
            {isFree ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                FREE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                OCCUPIED
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Context Banner */}
        <div
          className={`rounded-2xl p-3 mb-4 text-xs ${
            isFree
              ? 'bg-emerald-50/70 border border-emerald-100/90 text-emerald-950'
              : 'bg-slate-50 border border-slate-100 text-slate-700'
          }`}
        >
          {isFree ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Free for {consecutiveFree} {consecutiveFree === 1 ? 'period' : 'consecutive periods'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700/90 font-medium">
                Available until {endTiming.endTime} ({consecutiveFree > 1 ? `Periods ${selectedPeriod} to ${endPeriodIndex + 1}` : `Period ${selectedPeriod}`})
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Class actively in session</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {nextFreePeriodIndex !== -1
                  ? `Next free at Period ${nextFreePeriodIndex + 1} (${PERIOD_TIMINGS[nextFreePeriodIndex].startTime})`
                  : 'Occupied for the remaining periods today'}
              </p>
            </div>
          )}
        </div>

        {/* 9-Period Mini Schedule Strip */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Period Schedule ({selectedDay.slice(0, 3)})</span>
            <span className="text-[10px] text-slate-400">{totalFreeToday} of 9 periods free</span>
          </div>

          <div className="grid grid-cols-9 gap-1">
            {schedule.map((slot, idx) => {
              const pNum = idx + 1;
              const isSlotFree = slot === 0;
              const isSelected = pNum === selectedPeriod;
              const timing = PERIOD_TIMINGS[idx];

              return (
                <div key={idx} className="relative group/slot">
                  <button
                    type="button"
                    onClick={() => onSelectPeriod(pNum)}
                    onMouseEnter={() => setHoveredPeriod(pNum)}
                    onMouseLeave={() => setHoveredPeriod(null)}
                    title={`Period ${pNum} (${timing.startTime} - ${timing.endTime}): ${isSlotFree ? 'Free' : 'Occupied'}`}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? isSlotFree
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-1 shadow-xs'
                          : 'bg-rose-600 text-white ring-2 ring-rose-400 ring-offset-1 shadow-xs'
                        : isSlotFree
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                    }`}
                  >
                    <span>{pNum}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick period indicator legend */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>08:30 AM (P1)</span>
            <span>05:05 PM (P9)</span>
          </div>
        </div>

        {/* Amenities Icons */}
        <div className="flex items-center gap-3 pt-2 pb-1 text-slate-400 text-xs border-t border-slate-100 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] text-slate-600" title="High-Speed EduRoam Wi-Fi">
            <Wifi className="w-3 h-3 text-slate-400" />
            Wi-Fi
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-600" title="Projector & Smart Board">
            <Monitor className="w-3 h-3 text-slate-400" />
            Projector
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-600" title="Power Charging Sockets">
            <Zap className="w-3 h-3 text-slate-400" />
            Power Outlets
          </span>
        </div>
      </div>

      {/* Footer CTA: Inspect Details */}
      <div className="pt-3 mt-2">
        <button
          type="button"
          onClick={() => onOpenDetails(room)}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold border border-slate-200/80 hover:border-emerald-200 transition-all cursor-pointer"
        >
          <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Full 5-Day Timetable</span>
          <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover:text-emerald-600" />
        </button>
      </div>
    </div>
  );
};
