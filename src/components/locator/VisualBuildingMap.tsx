'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  DoorOpen, 
  Snowflake, 
  Wind, 
  Clock, 
  Compass, 
  Sparkles, 
  ChevronRight,
  Maximize2,
  Users,
  Wifi,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { 
  RoomSchedule, 
  DayOfWeek, 
  PERIOD_TIMINGS, 
  getConsecutiveFreePeriods, 
  getNextFreePeriodIndex, 
  getTotalFreePeriods 
} from '@/data/roomData';

interface VisualBuildingMapProps {
  rooms: RoomSchedule[];
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onSelectRoom: (room: RoomSchedule) => void;
}

export const VisualBuildingMap: React.FC<VisualBuildingMapProps> = ({
  rooms,
  selectedDay,
  selectedPeriod,
  onSelectRoom,
}) => {
  const periodIndex = selectedPeriod - 1;
  const currentTiming = PERIOD_TIMINGS[periodIndex];

  // Available floors list
  const floorList = [
    'All Floors',
    'Ground Floor',
    '2nd Floor',
    '4th Floor',
    '5th Floor',
    '6th Floor',
    '7th Floor',
  ];

  const [activeFloorTab, setActiveFloorTab] = useState<string>('All Floors');

  const displayedRooms = activeFloorTab === 'All Floors'
    ? rooms
    : rooms.filter(r => r.floor === activeFloorTab);

  // Group by floor for hierarchical blueprint layout
  const floorsMap = displayedRooms.reduce((acc, r) => {
    if (!acc[r.floor]) acc[r.floor] = [];
    acc[r.floor].push(r);
    return acc;
  }, {} as Record<string, RoomSchedule[]>);

  const floorOrder = ['Ground Floor', '2nd Floor', '4th Floor', '5th Floor', '6th Floor', '7th Floor'];
  const sortedFloors = Object.keys(floorsMap).sort((a, b) => {
    const idxA = floorOrder.indexOf(a);
    const idxB = floorOrder.indexOf(b);
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden mb-8">
      {/* Blueprint Top Ribbon */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span>Interactive Architectural Blueprint &bull; CSS Grid</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Campus Visual Floor Plan &bull; {selectedDay}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Physical room blocks mapped by campus wings. Click any room block to trigger the live countdown timer & WhatsApp squad invite!
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs font-bold">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span>Vibrant Green: AVAILABLE NOW</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Deep Red: OCCUPIED</span>
          </div>
        </div>
      </div>

      {/* Floor Level Filter Tabs */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex-shrink-0">
            Floor Filter:
          </span>
          {floorList.map(fl => {
            const isTabActive = activeFloorTab === fl;
            return (
              <button
                key={fl}
                type="button"
                onClick={() => setActiveFloorTab(fl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isTabActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {fl}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-semibold text-slate-500 hidden lg:flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Period {selectedPeriod}: {currentTiming.timeRange}</span>
        </div>
      </div>

      {/* Floor Plans Blueprint Container */}
      <div className="p-5 sm:p-7 space-y-8 bg-[#fbfcfd]">
        {sortedFloors.map(floorName => {
          const floorRooms = floorsMap[floorName] || [];
          const freeOnThisFloor = floorRooms.filter(r => (r.occupied[selectedDay]?.[periodIndex] ?? 1) === 0);

          return (
            <div 
              key={floorName}
              className="rounded-3xl border-2 border-dashed border-slate-300/90 bg-white p-5 sm:p-6 relative overflow-hidden shadow-xs"
            >
              {/* Architectural Grid Watermark / Level Marker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-xs shadow-md">
                    {floorName.slice(0, 2).trim()}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 tracking-tight">
                      {floorName} Architectural Schematic
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      North & South Wing Academic Corridors
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                    freeOnThisFloor.length > 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                    {freeOnThisFloor.length} of {floorRooms.length} Rooms Free
                  </span>
                </div>
              </div>

              {/* Physical Floor Plan Layout with CSS Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
                {floorRooms.map(room => {
                  const schedule = room.occupied[selectedDay] || [];
                  const isFree = (schedule[periodIndex] ?? 1) === 0;
                  const consecutive = isFree ? getConsecutiveFreePeriods(room, selectedDay, periodIndex) : 0;
                  const nextFree = !isFree ? getNextFreePeriodIndex(room, selectedDay, periodIndex) : -1;
                  const endTiming = PERIOD_TIMINGS[Math.min(periodIndex + consecutive - 1, PERIOD_TIMINGS.length - 1)];

                  return (
                    <div
                      key={room.room}
                      onClick={() => onSelectRoom(room)}
                      className={`group relative rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between select-none ${
                        isFree
                          ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border-emerald-500 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:border-emerald-400 hover:scale-[1.02]'
                          : 'bg-gradient-to-br from-rose-950/10 via-rose-950/5 to-white border-rose-400/80 shadow-xs hover:border-rose-500 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Top Bar of the Physical Room Block */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-xl sm:text-2xl font-black tracking-tight ${
                                isFree ? 'text-emerald-950 group-hover:text-emerald-700' : 'text-slate-800'
                              }`}>
                                {room.room}
                              </span>
                              {room.isAC ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 text-[10px] font-bold border border-cyan-300">
                                  <Snowflake className="w-2.5 h-2.5 text-cyan-600" />
                                  AC
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-semibold border border-slate-200">
                                  <Wind className="w-2.5 h-2.5 text-slate-400" />
                                  Non-AC
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400 block">
                              {room.floor} &bull; {room.room.includes('Lab') ? 'Specialized Lab' : 'Lecture Hall'}
                            </span>
                          </div>

                          {/* Dynamic Color Status Pill */}
                          <div>
                            {isFree ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                AVAILABLE NOW
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                OCCUPIED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Physical Architectural Room Floor Details */}
                        <div className={`p-3 rounded-xl border text-xs space-y-1 mb-3 ${
                          isFree
                            ? 'bg-emerald-500/10 border-emerald-300 text-emerald-950'
                            : 'bg-rose-50 border-rose-200 text-rose-950'
                        }`}>
                          {isFree ? (
                            <>
                              <div className="flex items-center gap-1.5 font-extrabold text-emerald-900">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Free for {consecutive} {consecutive === 1 ? 'Period' : 'Periods'} unbroken</span>
                              </div>
                              <p className="text-[11px] text-emerald-800 font-medium">
                                Unoccupied until {endTiming.endTime} ({consecutive > 1 ? `Periods ${selectedPeriod} - ${selectedPeriod + consecutive - 1}` : `Period ${selectedPeriod}`})
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5 font-extrabold text-rose-900">
                                <DoorOpen className="w-3.5 h-3.5 text-rose-600" />
                                <span>Lecture in session</span>
                              </div>
                              <p className="text-[11px] text-rose-700 font-medium">
                                {nextFree !== -1
                                  ? `Next free at Period ${nextFree + 1} (${PERIOD_TIMINGS[nextFree].startTime})`
                                  : 'Occupied for remaining periods today'}
                              </p>
                            </>
                          )}
                        </div>

                        {/* 9-Period Timeline Bar on the Block */}
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>Periods 1 to 9</span>
                            <span>{isFree ? '🟢 Green = Free' : '🔴 Red = Occupied'}</span>
                          </div>
                          <div className="grid grid-cols-9 gap-1">
                            {schedule.map((slot, idx) => {
                              const pNum = idx + 1;
                              const isSlotFree = slot === 0;
                              const isCurrent = pNum === selectedPeriod;

                              return (
                                <div
                                  key={idx}
                                  className={`py-1 rounded-sm text-[9px] font-bold text-center transition-all ${
                                    isCurrent
                                      ? isSlotFree
                                        ? 'bg-emerald-600 text-white ring-1 ring-emerald-300 font-black'
                                        : 'bg-rose-600 text-white ring-1 ring-rose-300 font-black'
                                      : isSlotFree
                                      ? 'bg-emerald-200 text-emerald-900'
                                      : 'bg-slate-200 text-slate-400'
                                  }`}
                                  title={`Period ${pNum}: ${isSlotFree ? 'Free' : 'Occupied'}`}
                                >
                                  {pNum}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-emerald-700">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {room.room.includes('Lab') ? '45 Workstations' : '65 Desks'}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-700 group-hover:underline">
                          <span>{isFree ? 'Open Live Countdown' : 'View Timetable'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
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
