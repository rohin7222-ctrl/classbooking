'use client';

import React from 'react';
import { Snowflake, Wind, Check, X, MapPin } from 'lucide-react';
import { RoomSchedule, DayOfWeek, PERIOD_TIMINGS } from '@/data/roomData';

interface MasterMatrixViewProps {
  rooms: RoomSchedule[];
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onSelectPeriod: (p: number) => void;
  onOpenDetails: (room: RoomSchedule) => void;
}

export const MasterMatrixView: React.FC<MasterMatrixViewProps> = ({
  rooms,
  selectedDay,
  selectedPeriod,
  onSelectPeriod,
  onOpenDetails,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Master Occupancy Matrix &bull; {selectedDay}
          </h3>
          <p className="text-xs text-slate-500">
            Side-by-side comparison of all 10 monitored classrooms across Periods 1 to 9.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            0 = Free Room
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            1 = Occupied
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 sticky left-0 bg-slate-50/95 z-10 backdrop-blur-xs">Room / Floor</th>
              <th className="py-3 px-3 text-center">AC</th>
              {PERIOD_TIMINGS.map(pt => {
                const isSelected = pt.period === selectedPeriod;
                return (
                  <th
                    key={pt.period}
                    onClick={() => onSelectPeriod(pt.period)}
                    className={`py-3 px-2 text-center cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-100/70 text-emerald-950 font-black'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div>P{pt.period}</div>
                    <div className="text-[9px] font-normal lowercase text-slate-400">
                      {pt.startTime}
                    </div>
                  </th>
                );
              })}
              <th className="py-3 px-3 text-center">Free Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {rooms.map(room => {
              const schedule = room.occupied[selectedDay] || [];
              const freeCount = schedule.filter(s => s === 0).length;

              return (
                <tr key={room.room} className="hover:bg-slate-50/70 transition-colors">
                  {/* Room Name & Floor */}
                  <td className="py-3 px-4 sticky left-0 bg-white hover:bg-slate-50/70 z-10 font-bold text-slate-900 border-r border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpenDetails(room)}
                      className="text-left group cursor-pointer"
                    >
                      <div className="group-hover:text-emerald-700 transition-colors">
                        {room.room}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {room.floor}
                      </div>
                    </button>
                  </td>

                  {/* AC Badge */}
                  <td className="py-3 px-3 text-center">
                    {room.isAC ? (
                      <span className="inline-flex p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200" title="Air Conditioned">
                        <Snowflake className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-md bg-slate-100 text-slate-400" title="Non-AC">
                        <Wind className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Periods 1 to 9 */}
                  {schedule.map((slot, idx) => {
                    const isFree = slot === 0;
                    const pNum = idx + 1;
                    const isSelectedPeriod = pNum === selectedPeriod;

                    return (
                      <td
                        key={idx}
                        onClick={() => onSelectPeriod(pNum)}
                        className={`py-2 px-1 text-center cursor-pointer ${
                          isSelectedPeriod ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <div
                          className={`mx-auto w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] transition-transform hover:scale-105 ${
                            isFree
                              ? isSelectedPeriod
                                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : isSelectedPeriod
                              ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={`Period ${pNum}: ${isFree ? 'FREE' : 'Occupied'}`}
                        >
                          {isFree ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <X className="w-3.5 h-3.5 stroke-[2]" />
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Total Free Today */}
                  <td className="py-3 px-3 text-center font-bold text-slate-700">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                        freeCount >= 5
                          ? 'bg-emerald-100 text-emerald-800'
                          : freeCount >= 2
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {freeCount} / 9
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
