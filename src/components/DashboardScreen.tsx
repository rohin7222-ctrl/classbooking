'use client';

import React, { useState } from 'react';
import { SubjectPrediction, SimulationSettings } from '../types/attendance';
import { SubjectCard } from './SubjectCard';
import { AttendanceCharts } from './AttendanceCharts';
import { LeavePlanner } from './LeavePlanner';
import { AcademicRecoveryCard } from './AcademicRecoveryCard';
import { KPIOverview } from './KPIOverview';
import { 
  GraduationCap, 
  Calendar as CalendarIcon, 
  User, 
  AlertTriangle, 
  X, 
  ArrowLeft, 
  CalendarCheck2, 
  CheckCircle2,
  Sparkles 
} from 'lucide-react';

interface DashboardScreenProps {
  section: string;
  targetDate: string;
  totalClassesRemaining: number;
  subjects: SubjectPrediction[];
  onGoBack: () => void;
  simulation: SimulationSettings;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationSettings>>;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  section,
  targetDate,
  totalClassesRemaining,
  subjects,
  onGoBack,
  simulation,
  setSimulation,
}) => {
  // Detention warning condition: if any subject is marked as danger or detention
  const hasDangerOrDetention = subjects.some(
    s => s.status === 'danger' || s.status === 'detention'
  );

  const [dismissWarning, setDismissWarning] = useState<boolean>(false);

  // Format date nicely (e.g., 2026-11-29 -> Nov 29, 2026)
  const formatDateString = (dateStr: string) => {
    try {
      if (!dateStr) return 'Nov 29, 2026';
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) return dateStr;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isSimulated = simulation.odDays > 0 || simulation.sickDays > 0;

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Row */}
      <KPIOverview
        subjects={subjects}
        totalClassesRemaining={totalClassesRemaining}
        odDays={simulation.odDays}
        sickDays={simulation.sickDays}
      />

      {/* Main Dashboard Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xl shadow-slate-100/60 w-full transition-all">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  2. Attendance Insights &amp; Planner
                </h2>
                {isSimulated && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    <Sparkles className="w-2.5 h-2.5" />
                    Simulated
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Class breakdown and targets</p>
            </div>
          </div>

          {/* Section and Date Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{section}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDateString(targetDate)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-5 pt-4">
          {/* Conditionally-rendered Irreversible Detention Warning Banner */}
          {hasDangerOrDetention && !dismissWarning && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-4.5 flex items-start justify-between gap-3 text-red-700 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 mt-0.5">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-red-600 uppercase tracking-wide">
                    IRREVERSIBLE DETENTION WARNING
                  </h3>
                  <p className="text-xs text-red-600 mt-0.5 leading-relaxed font-medium">
                    {simulation.sickDays > 0 
                      ? `Upcoming sick leave of ${simulation.sickDays} day(s) pushes one or more subjects into irreversible detention.`
                      : "Your attendance is below the required limit. You may face detention if you don't meet the target."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDismissWarning(true)}
                className="text-red-400 hover:text-red-700 hover:bg-red-100/60 p-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                title="Dismiss warning"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hero Card: Total Classes Remaining in Semester */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-blue-50/70 border border-blue-100 rounded-2xl p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                <CalendarCheck2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                  Total Classes Remaining in Semester:
                </p>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {totalClassesRemaining}
                </span>
              </div>
            </div>

            {/* Decorative Calendar Graphic with Checkmark badge */}
            <div className="relative flex items-center justify-center pr-2 flex-shrink-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl border-2 border-blue-200/80 shadow-md flex flex-col overflow-hidden">
                <div className="bg-blue-500 h-4 sm:h-5 w-full flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-1 p-1.5 opacity-40">
                  <div className="bg-slate-300 rounded-sm"></div>
                  <div className="bg-slate-300 rounded-sm"></div>
                  <div className="bg-slate-300 rounded-sm"></div>
                  <div className="bg-slate-300 rounded-sm"></div>
                  <div className="bg-blue-400 rounded-sm"></div>
                  <div className="bg-slate-300 rounded-sm"></div>
                </div>
              </div>

              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md border-2 border-white">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Leave & On-Duty Planner */}
          <LeavePlanner
            simulation={simulation}
            setSimulation={setSimulation}
            subjects={subjects}
          />

          {/* Academic Standing, Marks & Recovery Blueprint */}
          <AcademicRecoveryCard
            subjects={subjects}
            simulation={simulation}
          />

          {/* Attendance Visuals & Charts (Recharts) */}
          <AttendanceCharts
            subjects={subjects.map(s => ({
              id: s.id,
              name: s.name,
              currentPercentage: s.currentPercentage,
              targetPercentage: s.targetPercentage,
              tPast: s.tPast || 0,
              tFuture: s.tFuture || s.remainingClasses || 0,
              tTotal: s.tTotal || 0,
              attendedClasses: 0,
              requiredClassesToAttend: s.requiredClassesToAttend,
              bunkableClasses: s.bunkableClasses || 0,
              maxAchievablePercentage: s.maxAchievablePercentage,
              status: s.status,
              statusText: s.statusText,
              isIrreversibleDetention: s.isIrreversibleDetention,
              iconType: s.iconType,
              odCredit: s.odCredit || 0,
              sickDeduction: s.sickDeduction || 0,
              maxAttendableFuture: s.remainingClasses,
            }))}
          />

          {/* Subject Cards Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Course Targets &amp; Required Attendance
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {subjects.length} Courses Evaluated
              </span>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {subjects.map(subject => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                />
              ))}
            </div>
          </div>

          {/* Back / Edit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onGoBack}
              className="w-full border border-blue-200 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-2xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>Modify Details / Recalculate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
