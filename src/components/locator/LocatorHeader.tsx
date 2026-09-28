'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, Sparkles } from 'lucide-react';
import { PERIOD_TIMINGS, getCurrentPeriodFromTime, getCurrentDayOfWeek } from '@/data/roomData';

interface LocatorHeaderProps {
  selectedDay: string;
  selectedPeriod: number;
}

export const LocatorHeader: React.FC<LocatorHeaderProps> = ({ selectedDay, selectedPeriod }) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [livePeriod, setLivePeriod] = useState<number>(1);
  const [liveDay, setLiveDay] = useState<string>('Monday');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLivePeriod(getCurrentPeriodFromTime(now));
      setLiveDay(getCurrentDayOfWeek(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentPeriodInfo = PERIOD_TIMINGS.find(p => p.period === selectedPeriod);

  return (
    <header className="pt-6 pb-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/25 flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                VibeCraft <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Free Class Locator</span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Round 2 - Phase 1
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Instant empty classrooms & AC lab finder across all college timetable blocks.
            </p>
          </div>
        </div>

        {/* Global Nav & Live Clock */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Live Clock Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>{currentTimeStr || '09:00 AM'}</span>
            <span className="text-[10px] text-slate-400 font-normal">| Live P{livePeriod} ({liveDay.slice(0,3)})</span>
          </div>

          {/* Campus Locator Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus Suite Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
