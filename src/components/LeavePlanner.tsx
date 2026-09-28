'use client';

import React from 'react';
import { SimulationSettings } from '../types/attendance';
import { Briefcase, HeartPulse, RotateCcw, Sparkles, Check } from 'lucide-react';

interface LeavePlannerProps {
  simulation: SimulationSettings;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationSettings>>;
  subjects?: Array<{
    name: string;
    currentPercentage: number;
    tPast?: number;
    odCredit?: number;
    sickDeduction?: number;
  }>;
}

export const LeavePlanner: React.FC<LeavePlannerProps> = ({
  simulation,
  setSimulation,
  subjects,
}) => {
  const updateOD = (delta: number) => {
    setSimulation(prev => ({
      ...prev,
      odDays: Math.max(0, Math.min(20, prev.odDays + delta)),
    }));
  };

  const updateSick = (delta: number) => {
    setSimulation(prev => ({
      ...prev,
      sickDays: Math.max(0, Math.min(20, prev.sickDays + delta)),
    }));
  };

  const setExactOD = (days: number) => {
    setSimulation(prev => ({ ...prev, odDays: days }));
  };

  const setExactSick = (days: number) => {
    setSimulation(prev => ({ ...prev, sickDays: days }));
  };

  const handleReset = () => {
    setSimulation({ odDays: 0, sickDays: 0 });
  };

  const isSimulated = simulation.odDays > 0 || simulation.sickDays > 0;

  // Live mathematical calculation from current subjects
  let totalPastConducted = 0;
  let totalPastAttended = 0;
  if (subjects && subjects.length > 0) {
    for (const s of subjects) {
      const past = s.tPast || 15;
      totalPastConducted += past;
      totalPastAttended += Math.round(((s.currentPercentage || 70) / 100) * past);
    }
  } else {
    totalPastConducted = 92;
    totalPastAttended = 67;
  }

  const currentAvgPct = totalPastConducted > 0 
    ? Math.round((totalPastAttended / totalPastConducted) * 1000) / 10 
    : 72.8;

  // Sick leave drop
  const totalMissed = subjects && subjects.length > 0
    ? subjects.reduce((sum, s) => sum + (s.sickDeduction || 0), 0)
    : Math.round(simulation.sickDays * 4.4);
  const newConductedLeave = totalPastConducted + totalMissed;
  const newPctLeave = newConductedLeave > 0
    ? Math.round((totalPastAttended / newConductedLeave) * 1000) / 10
    : currentAvgPct;
  const leaveDrop = Math.max(0, Math.round((currentAvgPct - newPctLeave) * 10) / 10);

  // OD boost
  const totalCredited = subjects && subjects.length > 0
    ? subjects.reduce((sum, s) => sum + (s.odCredit || 0), 0)
    : Math.round(simulation.odDays * 4.4);
  const newAttendedOD = totalPastAttended + totalCredited;
  const newConductedOD = totalPastConducted + totalCredited;
  const newPctOD = newConductedOD > 0
    ? Math.min(100, Math.round((newAttendedOD / newConductedOD) * 1000) / 10)
    : currentAvgPct;
  const odBoost = Math.max(0, Math.round((newPctOD - currentAvgPct) * 10) / 10);

  return (
    <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/50 rounded-2xl border border-indigo-100 p-5 sm:p-6 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/80">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            What-If Simulator
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Leave &amp; On-Duty (OD) Planner
          </h3>
          <p className="text-xs text-slate-500">
            See instantly how attending events or taking sick days affects your detention risks.
          </p>
        </div>

        {isSimulated && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset to Zero
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* OD (On-Duty) Card */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Upcoming OD (On-Duty)</h4>
                <span className="text-[11px] font-bold text-emerald-600">
                  + Positive Impact (Credited as Attended)
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mb-3">
            Hackathons, sports, or official college activities.
          </p>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Quick:</span>
            {[1, 2, 3, 5].map(days => (
              <button
                key={days}
                type="button"
                onClick={() => setExactOD(days)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                  simulation.odDays === days
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                +{days}d
              </button>
            ))}
          </div>

          {/* Stepper Input */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <span className="text-xs font-bold text-slate-700 pl-2">
              OD Days:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateOD(-1)}
                disabled={simulation.odDays <= 0}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                -
              </button>
              <span className="w-7 text-center text-sm font-black text-slate-900">
                {simulation.odDays}
              </span>
              <button
                type="button"
                onClick={() => updateOD(1)}
                disabled={simulation.odDays >= 20}
                className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center justify-center disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Live OD Impact Display */}
          {simulation.odDays > 0 ? (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
              <span>📈 <strong>+{odBoost}% Boost:</strong> {currentAvgPct}% ➔ <strong>{newPctOD}%</strong></span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                +{totalCredited} classes credited
              </span>
            </div>
          ) : (
            <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-[11px] text-center">
              Each OD day credits attendance without attending regular classes
            </div>
          )}
        </div>

        {/* Sick Leave Card */}
        <div className="bg-white rounded-2xl border border-rose-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Upcoming Sick Leaves</h4>
                <span className="text-[11px] font-bold text-rose-600">
                  - Negative Impact (Cannot Attend)
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mb-3">
            Simulates missed days. Tests if taking off will cause detention.
          </p>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Quick:</span>
            {[1, 2, 3, 5].map(days => (
              <button
                key={days}
                type="button"
                onClick={() => setExactSick(days)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                  simulation.sickDays === days
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>

          {/* Stepper Input */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <span className="text-xs font-bold text-slate-700 pl-2">
              Sick Days:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateSick(-1)}
                disabled={simulation.sickDays <= 0}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                -
              </button>
              <span className="w-7 text-center text-sm font-black text-slate-900">
                {simulation.sickDays}
              </span>
              <button
                type="button"
                onClick={() => updateSick(1)}
                disabled={simulation.sickDays >= 20}
                className="w-7 h-7 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center justify-center disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Live Sick Leave Impact Display */}
          {simulation.sickDays > 0 ? (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center justify-between">
              <span>📉 <strong>-{leaveDrop}% Drop:</strong> {currentAvgPct}% ➔ <strong>{newPctLeave}%</strong></span>
              <span className="text-[10px] bg-rose-200/80 text-rose-950 px-2 py-0.5 rounded-full font-bold">
                ~{totalMissed} classes missed
              </span>
            </div>
          ) : (
            <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-[11px] text-center">
              Simulate sick days to calculate exact percentage drop &amp; risk
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
