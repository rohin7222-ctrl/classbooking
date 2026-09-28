'use client';

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Snowflake, 
  LayoutGrid, 
  Building2,
  Compass,
  Layers, 
  TableProperties, 
  Zap, 
  RotateCcw 
} from 'lucide-react';
import { DayOfWeek, DAYS_OF_WEEK, PERIOD_TIMINGS, getCurrentPeriodFromTime, getCurrentDayOfWeek } from '@/data/roomData';

export type ViewMode = 'visual-map' | 'cards' | 'map' | 'floors' | 'matrix';
export type StatusFilter = 'all' | 'free' | 'occupied';
export type ACFilter = 'all' | 'ac' | 'non-ac';

interface LocatorFiltersProps {
  selectedDay: DayOfWeek;
  setSelectedDay: (day: DayOfWeek) => void;
  selectedPeriod: number;
  setSelectedPeriod: (p: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  acFilter: ACFilter;
  setAcFilter: (filter: ACFilter) => void;
  floorFilter: string;
  setFloorFilter: (floor: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  availableFloors: string[];
}

export const LocatorFilters: React.FC<LocatorFiltersProps> = ({
  selectedDay,
  setSelectedDay,
  selectedPeriod,
  setSelectedPeriod,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  acFilter,
  setAcFilter,
  floorFilter,
  setFloorFilter,
  viewMode,
  setViewMode,
  availableFloors,
}) => {
  const currentLiveDay = getCurrentDayOfWeek();
  const currentLivePeriod = getCurrentPeriodFromTime();

  const handleResetFilters = () => {
    setSelectedDay(currentLiveDay);
    setSelectedPeriod(currentLivePeriod);
    setSearchQuery('');
    setStatusFilter('all');
    setAcFilter('all');
    setFloorFilter('all');
  };

  const currentPeriodInfo = PERIOD_TIMINGS.find(p => p.period === selectedPeriod);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs mb-6 space-y-5">
      {/* 1. Day Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Day of Week</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = selectedDay === day;
            const isToday = currentLiveDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Period Selection Bar */}
      <div className="space-y-2 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Period (1 to 9)
            </span>
            {currentPeriodInfo && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                {currentPeriodInfo.timeRange}
              </span>
            )}
          </div>

          {/* Quick jump to Live Period */}
          <button
            type="button"
            onClick={() => {
              setSelectedDay(currentLiveDay);
              setSelectedPeriod(currentLivePeriod);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-teal-600" />
            <span>Sync to Live Now (P{currentLivePeriod})</span>
          </button>
        </div>

        {/* 9 Period Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
          {PERIOD_TIMINGS.map(pt => {
            const isSelected = selectedPeriod === pt.period;
            const isCurrentLive = currentLivePeriod === pt.period && selectedDay === currentLiveDay;

            return (
              <button
                key={pt.period}
                type="button"
                onClick={() => setSelectedPeriod(pt.period)}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isCurrentLive && (
                  <span className="absolute -top-1.5 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                )}
                <span className="text-xs font-extrabold">P{pt.period}</span>
                <span className="text-[10px] text-slate-400 font-normal truncate max-w-full">
                  {pt.startTime}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search, Filters, and View Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search room (e.g. IST 227, Lab, 4th Floor)..."
            className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="free">🟢 Free Only</option>
            <option value="occupied">🔴 Occupied Only</option>
          </select>

          {/* AC Filter */}
          <select
            value={acFilter}
            onChange={e => setAcFilter(e.target.value as ACFilter)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="all">❄️ All Rooms</option>
            <option value="ac">❄️ AC Rooms Only</option>
            <option value="non-ac">Non-AC Only</option>
          </select>

          {/* Floor Filter */}
          <select
            value={floorFilter}
            onChange={e => setFloorFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="all">🏢 All Floors</option>
            {availableFloors.map(floor => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset Filters"
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* View Toggle */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('visual-map')}
              title="Interactive Visual Building Map (Physical Floor Plan Grid)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'visual-map'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Cards View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              title="Campus Architectural Elevation Map"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('floors')}
              title="Floor Grouped View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'floors'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              title="Master Matrix View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableProperties className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
