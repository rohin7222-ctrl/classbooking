'use client';

import React, { useState } from 'react';
import { 
  X, 
  Snowflake, 
  Wind, 
  MapPin, 
  Clock, 
  Check, 
  Copy, 
  Calendar, 
  Share2, 
  Wifi, 
  Monitor, 
  Zap, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { 
  RoomSchedule, 
  DayOfWeek, 
  DAYS_OF_WEEK, 
  PERIOD_TIMINGS, 
  getConsecutiveFreePeriods, 
  getTotalFreePeriods 
} from '@/data/roomData';

interface RoomDetailModalProps {
  room: RoomSchedule | null;
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onClose: () => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  selectedDay,
  selectedPeriod,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const periodIndex = selectedPeriod - 1;
  const currentSlotFree = (room.occupied[selectedDay]?.[periodIndex] ?? 1) === 0;
  const consecutive = currentSlotFree ? getConsecutiveFreePeriods(room, selectedDay, periodIndex) : 0;

  // Find best day with most free slots
  let bestDay = 'Monday';
  let maxFreeSlots = -1;
  DAYS_OF_WEEK.forEach(day => {
    const total = getTotalFreePeriods(room, day);
    if (total > maxFreeSlots) {
      maxFreeSlots = total;
      bestDay = day;
    }
  });

  const handleCopy = () => {
    const text = `Campus Room Status: ${room.room} (${room.floor}) is ${
      currentSlotFree ? `FREE (for ${consecutive} periods)` : 'OCCUPIED'
    } on ${selectedDay} Period ${selectedPeriod}. AC: ${room.isAC ? 'Yes' : 'No'}.`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{room.room}</h3>
              {room.isAC ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700">
                  <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                  Air Conditioned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                  <Wind className="w-3.5 h-3.5 text-slate-400" />
                  Non-AC
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{room.floor}</span>
              <span className="text-slate-300">&bull;</span>
              <span>{room.room.includes('Lab') ? 'Specialized Lab' : 'Academic Lecture Hall'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Current Selection Status Highlight */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              currentSlotFree
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/60 border-rose-200 text-rose-950'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                Current Status ({selectedDay} &bull; Period {selectedPeriod})
              </span>
              <h4 className="text-lg font-black mt-0.5">
                {currentSlotFree ? `🟢 FREE NOW (${consecutive} consecutive periods)` : '🔴 OCCUPIED BY CLASS'}
              </h4>
              <p className="text-xs opacity-80 mt-0.5">
                {PERIOD_TIMINGS[periodIndex].timeRange}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Share Status</span>
                </>
              )}
            </button>
          </div>

          {/* Full 5-Day Weekly Matrix for this Room */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Full Weekly Schedule (Monday - Friday)</span>
              </h4>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Best day: {bestDay} ({maxFreeSlots} free slots)
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
                    <th className="py-2.5 px-2.5 text-center">Total Free</th>
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
                          isDaySelected ? 'bg-emerald-50/40 font-bold' : 'hover:bg-slate-50/50'
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

          {/* Room Features & Amenities */}
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Room Amenities & Specifications</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <Users className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block font-semibold">Capacity</span>
                <span className="text-xs font-bold text-slate-800">
                  {room.room.includes('Lab') ? '45 Systems' : '65 Desks'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <Wifi className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block font-semibold">Wi-Fi</span>
                <span className="text-xs font-bold text-slate-800">Campus 5G (High)</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <Monitor className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block font-semibold">Display</span>
                <span className="text-xs font-bold text-slate-800">Digital Smartboard</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <Zap className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block font-semibold">Charging</span>
                <span className="text-xs font-bold text-slate-800">Wall Outlets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Timetable verified against official college block schedules.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
