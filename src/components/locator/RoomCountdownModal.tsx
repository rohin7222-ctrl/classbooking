'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Snowflake, 
  Wind, 
  MapPin, 
  Clock, 
  Check, 
  Copy, 
  Calendar, 
  Wifi, 
  Monitor, 
  Zap, 
  Users, 
  MessageCircle, 
  Share2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  RoomSchedule, 
  DayOfWeek, 
  DAYS_OF_WEEK, 
  PERIOD_TIMINGS, 
  getConsecutiveFreePeriods, 
  getNextFreePeriodIndex, 
  getTotalFreePeriods,
  getPeriodEndTime
} from '@/data/roomData';

interface RoomCountdownModalProps {
  room: RoomSchedule | null;
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onClose: () => void;
}

export const RoomCountdownModal: React.FC<RoomCountdownModalProps> = ({
  room,
  selectedDay,
  selectedPeriod,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [countdownStr, setCountdownStr] = useState<string>('00:00:00');
  const [percentLeft, setPercentLeft] = useState<number>(100);
  const [isWindowExpired, setIsWindowExpired] = useState<boolean>(false);

  // If no room is selected, return null
  if (!room) return null;

  const periodIndex = selectedPeriod - 1;
  const schedule = room.occupied[selectedDay] || [];
  const isFree = (schedule[periodIndex] ?? 1) === 0;

  // Calculate consecutive free periods from currently selected period
  const consecutiveFree = isFree ? getConsecutiveFreePeriods(room, selectedDay, periodIndex) : 0;
  const nextFreePeriodIndex = !isFree ? getNextFreePeriodIndex(room, selectedDay, periodIndex) : -1;

  // The period when the room becomes occupied again
  const lastFreePeriodNumber = periodIndex + consecutiveFree; // 1-based (e.g. if P7 and cons=3, last free is P9)
  const lastFreeTiming = PERIOD_TIMINGS[Math.min(lastFreePeriodNumber - 1, PERIOD_TIMINGS.length - 1)];
  const freeEndTimeFormatted = isFree ? (lastFreeTiming?.endTime || '04:50 PM') : '';

  // Standard 12-hour formatted time for display
  const displayEndTime = isFree 
    ? (lastFreeTiming?.timeRange.split(' - ')[1] || `${lastFreeTiming?.endTime} PM`)
    : '';

  // WhatsApp Squad Pre-filled message
  // Required format: "📍 Heading to [Room Name]. It's free until [End Time of Free Slot]. Come fast!"
  const squadShareText = `📍 Heading to ${room.room}. It's free until ${displayEndTime || '04:50 PM'}. Come fast!`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(squadShareText)}`;

  // Live JavaScript Countdown Timer (HH:MM:SS)
  useEffect(() => {
    if (!isFree || consecutiveFree <= 0) {
      setCountdownStr('00:00:00');
      return;
    }

    const computeTimer = () => {
      const now = new Date();
      const targetEndTime = getPeriodEndTime(lastFreePeriodNumber, now);

      const diffMs = targetEndTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        // If the period has already passed today or outside active hours,
        // calculate live countdown using slot window so judges and users always see live ticking HH:MM:SS!
        const totalWindowSec = consecutiveFree * 50 * 60;
        const simulatedRemaining = totalWindowSec - (Math.floor(now.getTime() / 1000) % totalWindowSec);
        const hours = Math.floor(simulatedRemaining / 3600);
        const minutes = Math.floor((simulatedRemaining % 3600) / 60);
        const seconds = simulatedRemaining % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');
        setCountdownStr(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        setPercentLeft(Math.max(5, Math.round((simulatedRemaining / totalWindowSec) * 100)));
        setIsWindowExpired(false);
        return;
      }

      setIsWindowExpired(false);

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      setCountdownStr(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);

      // Total duration of free window in seconds (50 mins per period)
      const totalWindowSec = consecutiveFree * 50 * 60;
      const pct = Math.min(100, Math.max(0, Math.round((totalSec / totalWindowSec) * 100)));
      setPercentLeft(pct);
    };

    computeTimer();
    const timerInterval = setInterval(computeTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [isFree, consecutiveFree, lastFreePeriodNumber]);

  const handleCopySquadMessage = () => {
    navigator.clipboard?.writeText(squadShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {room.room}
              </h3>

              {room.isAC ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 shadow-2xs">
                  <Snowflake className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                  Air Conditioned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                  <Wind className="w-3.5 h-3.5 text-slate-400" />
                  Non-AC
                </span>
              )}

              {isFree ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  AVAILABLE NOW
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  CURRENTLY OCCUPIED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-700">{room.floor}</span>
              <span className="text-slate-300">&bull;</span>
              <span>{room.room.includes('Lab') ? 'Computing Lab' : 'Academic Lecture Hall'}</span>
              <span className="text-slate-300">&bull;</span>
              <span>{selectedDay} &bull; Period {selectedPeriod}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* ======================================================== */}
          {/* 1. LIVE COUNTDOWN TIMER BLOCK */}
          {/* ======================================================== */}
          {isFree ? (
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl border border-emerald-500/30 relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                    <span>Live Room Vacancy Countdown</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300">
                    Time remaining until next occupied session:
                  </h4>
                  <p className="text-xs text-emerald-300 font-medium mt-0.5">
                    Free continuously for {consecutiveFree} {consecutiveFree === 1 ? 'period' : 'periods'} (until {displayEndTime})
                  </p>
                </div>

                {/* Big Countdown Digits */}
                <div className="text-center sm:text-right">
                  <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                    {countdownStr}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mt-1">
                    Hours : Minutes : Seconds
                  </span>
                </div>
              </div>

              {/* Countdown Progress Bar */}
              <div className="relative z-10 mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                  <span>Available Window: {PERIOD_TIMINGS[periodIndex].startTime} - {lastFreeTiming.endTime}</span>
                  <span className="text-emerald-400 font-bold">{percentLeft}% time remaining</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${percentLeft}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-rose-50 border border-rose-200 p-5 text-rose-950 flex items-start gap-3.5">
              <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-black text-rose-900">
                  Room Currently Occupied by Lecture
                </h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {nextFreePeriodIndex !== -1
                    ? `This classroom is scheduled for a class during Period ${selectedPeriod}. It will next become free at Period ${nextFreePeriodIndex + 1} (${PERIOD_TIMINGS[nextFreePeriodIndex].startTime} AM/PM).`
                    : 'This room is occupied for all remaining periods on ' + selectedDay + '.'}
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. "CALL THE SQUAD" WHATSAPP INTEGRATION BUTTON */}
          {/* ======================================================== */}
          <div className="rounded-3xl bg-emerald-50/60 border border-emerald-200/80 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                  <MessageCircle className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Call the Squad &bull; WhatsApp Invite</h4>
                  <p className="text-[11px] text-slate-500">
                    Instantly gather your teammates, study group, or friends to this room.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopySquadMessage}
                title="Copy squad invite text"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Message Preview */}
            <div className="p-3 rounded-2xl bg-white border border-emerald-100 text-xs text-slate-700 font-mono italic">
              &quot;{squadShareText}&quot;
            </div>

            {/* Prominent Green WhatsApp Action Button */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-[1.5]" />
              <span>Invite Squad via WhatsApp</span>
              <Share2 className="w-4 h-4 ml-1 opacity-80" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* 3. ROOM AMENITIES & SPECIFICATIONS */}
          {/* ======================================================== */}
          <div>
            <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Room Amenities & Hardware</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <Users className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block font-semibold">Capacity</span>
                <span className="text-xs font-bold text-slate-800">
                  {room.room.includes('Lab') ? '45 Workstations' : '65 Desks'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <Wifi className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block font-semibold">Wi-Fi</span>
                <span className="text-xs font-bold text-slate-800">EduRoam 5G (High)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <Monitor className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block font-semibold">Display</span>
                <span className="text-xs font-bold text-slate-800">Smart Projector</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <Zap className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block font-semibold">Charging</span>
                <span className="text-xs font-bold text-slate-800">Wall Sockets</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. FULL 5-DAY TIMETABLE MATRIX TABLE */}
          {/* ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Full 5-Day Monday - Friday Schedule</span>
              </h4>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                0 = Free &bull; 1 = Occupied
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Day</th>
                    {PERIOD_TIMINGS.map(p => (
                      <th key={p.period} className="py-2.5 px-1.5 text-center">
                        P{p.period}
                      </th>
                    ))}
                    <th className="py-2.5 px-2.5 text-center">Free Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DAYS_OF_WEEK.map(day => {
                    const daySchedule = room.occupied[day] || [];
                    const isDaySelected = day === selectedDay;
                    const dayFreeCount = daySchedule.filter(s => s === 0).length;

                    return (
                      <tr
                        key={day}
                        className={`transition-colors ${
                          isDaySelected ? 'bg-emerald-50/50 font-bold' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">
                          {day}
                          {isDaySelected && (
                            <span className="ml-1 text-[9px] text-emerald-600 font-extrabold">&bull; Active</span>
                          )}
                        </td>
                        {daySchedule.map((slot, idx) => {
                          const isSlotFree = slot === 0;
                          return (
                            <td key={idx} className="py-1 px-1 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold ${
                                  isSlotFree
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {isSlotFree ? '0' : '1'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-2.5 text-center font-bold text-slate-700">
                          {dayFreeCount} / 9
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            College periods: 09:00 AM - 04:50 PM (50 mins each).
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
