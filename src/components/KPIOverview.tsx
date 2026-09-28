'use client';

import React from 'react';
import { SubjectPrediction } from '../types/attendance';
import { 
  Percent, 
  AlertTriangle, 
  CalendarClock, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';

interface KPIOverviewProps {
  subjects: SubjectPrediction[];
  totalClassesRemaining: number;
  odDays: number;
  sickDays: number;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({
  subjects,
  totalClassesRemaining,
  odDays,
  sickDays,
}) => {
  // Compute overall average percentage
  const avgPercentage = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.currentPercentage, 0) / subjects.length)
    : 0;

  // Counts by zone
  const dangerCount = subjects.filter(s => s.status === 'danger' || s.status === 'detention').length;
  const safeCount = subjects.filter(s => s.status === 'safe').length;
  const totalBunkable = subjects.reduce((sum, s) => sum + (s.bunkableClasses || 0), 0);

  // Overall status
  const isCritical = dangerCount > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Overall Average */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Average Attendance
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            avgPercentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <Percent className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {avgPercentage}%
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            avgPercentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {avgPercentage >= 75 ? 'Healthy' : 'Below 75%'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Across all {subjects.length} subjects</p>
      </div>

      {/* 2. Critical Risk Level */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            At-Risk Subjects
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isCritical ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {isCritical ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {dangerCount}
          </span>
          <span className="text-xs text-slate-500 font-semibold">of {subjects.length} subjects</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {dangerCount === 0 ? 'No subjects in detention risk' : 'Requires immediate attendance'}
        </p>
      </div>

      {/* 3. Classes Remaining */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Classes Remaining
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalClassesRemaining}
          </span>
          <span className="text-xs text-slate-500 font-semibold">periods</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Until Nov 29, 2026</p>
      </div>

      {/* 4. Safe Missable / Simulation Buffer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Safe Buffer
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {safeCount}
          </span>
          <span className="text-xs text-slate-500 font-semibold">safe courses</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {odDays > 0 ? `+${odDays} OD Days applied` : (sickDays > 0 ? `${sickDays} Sick Leave applied` : 'Total peace-of-mind courses')}
        </p>
      </div>
    </div>
  );
};
