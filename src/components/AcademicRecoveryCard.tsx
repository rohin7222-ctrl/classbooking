'use client';

import React, { useState } from 'react';
import { SubjectPrediction, SimulationSettings } from '../types/attendance';
import { 
  Award, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  Briefcase, 
  HeartPulse, 
  AlertOctagon, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AcademicRecoveryCardProps {
  subjects: SubjectPrediction[];
  simulation: SimulationSettings;
}

export const AcademicRecoveryCard: React.FC<AcademicRecoveryCardProps> = ({
  subjects,
  simulation,
}) => {
  const [activeTab, setActiveTab] = useState<'recovery' | 'losses' | 'marks'>('recovery');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Helper for internal marks tier (out of 5 per course)
  const getMarksForPct = (pct: number): number => {
    if (pct >= 90) return 5;
    if (pct >= 85) return 4;
    if (pct >= 80) return 3;
    if (pct >= 75) return 2;
    return 0;
  };

  // Compute baseline and projected marks
  let currentTotalMarks = 0;
  let projectedTotalMarks = 0;
  const maxPossibleMarks = subjects.length * 5;

  let totalPast = 0;
  let totalAttended = 0;

  for (const s of subjects) {
    const past = s.tPast || 15;
    const curPct = s.currentPercentage;
    const curAtt = Math.round((curPct / 100) * past);
    totalPast += past;
    totalAttended += curAtt;

    currentTotalMarks += getMarksForPct(curPct);

    // Projected after sick / OD simulation
    const missed = s.sickDeduction || 0;
    const credited = s.odCredit || 0;
    const newAtt = curAtt + credited;
    const newCond = past + missed + credited;
    const projPct = newCond > 0 ? (newAtt / newCond) * 100 : curPct;
    projectedTotalMarks += getMarksForPct(projPct);
  }

  const currentOverallPct = totalPast > 0 ? Math.round((totalAttended / totalPast) * 1000) / 10 : 72.8;
  const marksDifference = projectedTotalMarks - currentTotalMarks;
  const isLoss = marksDifference < 0;
  const isGain = marksDifference > 0;

  // Hall ticket status
  let hallTicketStatus: 'cleared' | 'condonation' | 'detained' = 'cleared';
  let hallTicketText = 'Exam Hall Ticket: Cleared (Normal Entry)';
  if (currentOverallPct < 65) {
    hallTicketStatus = 'detained';
    hallTicketText = 'Exam Hall Ticket: Withheld / Semester Detention Risk (<65%)';
  } else if (currentOverallPct < 75) {
    hallTicketStatus = 'condonation';
    hallTicketText = 'Condonation Fine (₹1,000 - ₹3,000) & Medical Proof Required (65% - 74.9%)';
  }

  // OD Days needed to neutralize sick days
  const odDaysNeeded = simulation.sickDays > 0 ? simulation.sickDays : 2;

  // Consecutive classes needed to pull up
  const streakClasses = Math.max(0, Math.ceil((0.75 * totalPast - totalAttended) / 0.25));

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-md shadow-indigo-100/40 p-5 sm:p-6 transition-all duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Academic Standing, Internal Marks &amp; Regain Blueprint
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Live Analysis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Attendance Internal Marks (out of 5 per course), Condonation &amp; Recovery Plan
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="self-start sm:self-auto text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand Roadmap'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* KPI Callout Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
        {/* 1. Internal Marks Standing */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-3.5">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Attendance Internal Marks
            </span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {simulation.sickDays > 0 || simulation.odDays > 0 ? projectedTotalMarks : currentTotalMarks}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ {maxPossibleMarks} Total Marks</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {simulation.sickDays > 0 && isLoss && (
              <span className="text-rose-600 font-bold">
                📉 {marksDifference} Marks Loss due to {simulation.sickDays}d leave!
              </span>
            )}
            {simulation.odDays > 0 && isGain && (
              <span className="text-emerald-600 font-bold">
                📈 +{marksDifference} Marks Gained via {simulation.odDays}d OD!
              </span>
            )}
            {!simulation.sickDays && !simulation.odDays && (
              <span>College Tier: 5m (≥90%), 4m (85%), 3m (80%), 2m (75%), 0m (&lt;75%)</span>
            )}
          </p>
        </div>

        {/* 2. Hall Ticket & Exam Entry Status */}
        <div className={`rounded-2xl border p-3.5 ${
          hallTicketStatus === 'cleared'
            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
            : (hallTicketStatus === 'condonation'
                ? 'border-amber-200 bg-amber-50/50 text-amber-800'
                : 'border-rose-200 bg-rose-50/50 text-rose-800')
        }`}>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Exam Hall Ticket Status
            </span>
            {hallTicketStatus === 'cleared' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="text-sm font-black leading-snug">
            {hallTicketStatus === 'cleared' && '✅ Approved (Normal Entry)'}
            {hallTicketStatus === 'condonation' && '⚠️ Condonation Fine Required'}
            {hallTicketStatus === 'detained' && '🚨 Hall Ticket Withheld'}
          </div>
          <p className="text-[11px] mt-1 opacity-80 leading-tight">
            {hallTicketText}
          </p>
        </div>

        {/* 3. Recovery Action Quick Metric */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3.5">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Recovery Action Needed
            </span>
            <Flame className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-black text-slate-900">
            {streakClasses > 0 ? `Attend ${streakClasses} Consecutive Classes` : '✅ Current Attendance On Track'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Or secure <strong>{odDaysNeeded} days of OD</strong> to offset missed lectures.
          </p>
        </div>
      </div>

      {/* Expandable Tabs Section */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-slate-100 animate-fadeIn">
          {/* Navigation Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('recovery')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'recovery'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Regain &amp; Recovery Blueprint (மீட்கும் வழிகள்)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('losses')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'losses'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>2. Penalties if Inactive (செய்யாவிட்டால் இழப்புகள்)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('marks')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'marks'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3. Course Marks Tier (பாடவாரி மார்க்)</span>
            </button>
          </div>

          {/* TAB 1: RECOVERY BLUEPRINT */}
          {activeTab === 'recovery' && (
            <div className="mt-3 space-y-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                <strong>💡 Step-by-Step Regain Blueprint:</strong> Follow these 4 official steps immediately after taking leave to restore your attendance percentage and recover lost internal marks.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-2 mb-1.5 text-indigo-700 font-extrabold">
                    <Briefcase className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Step 1: On-Duty (OD) Claim</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Participate in upcoming college hackathons, sports, symposium, or NSS activities. Approved OD gives <strong>100% Present attendance credit</strong>, directly canceling out missed lectures.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-2 mb-1.5 text-indigo-700 font-extrabold">
                    <HeartPulse className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Step 2: Medical Condonation Form</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Submit an authorized Government / Registered Medical Practitioner certificate with prescription to the HOD within <strong>3 to 5 working days</strong>. This qualifies you for the 65%–74.9% condonation cutoff.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-2 mb-1.5 text-indigo-700 font-extrabold">
                    <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Step 3: Lab &amp; Test Compensation</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Meet the practical course faculty for an extra lab session to complete pending experiments and get your record signed. Request a re-test / assignment for any missed Continuous Internal Assessment (CIA).
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-2 mb-1.5 text-indigo-700 font-extrabold">
                    <Flame className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Step 4: Attendance Streak</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Commit to attending the next <strong>{streakClasses > 0 ? streakClasses : 8} consecutive lectures</strong> without taking any absences. Consistent attendance rapidly boosts percentage above the 75% cutoff marker.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATASTROPHIC LOSSES & PENALTIES */}
          {activeTab === 'losses' && (
            <div className="mt-3 space-y-2.5">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>What happens if you take leave and do NOT take the recovery steps above:</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-rose-100 bg-white flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <h5 className="font-bold text-slate-900">Exam Detention &amp; Hall Ticket Withheld</h5>
                    <p className="text-[11px] text-slate-500">Barred from writing End-Semester Theory and Practical examinations if attendance drops below 75% without authorized medical condonation.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-100 bg-white flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <h5 className="font-bold text-slate-900">University Condonation Fine (₹1,000 to ₹3,000)</h5>
                    <p className="text-[11px] text-slate-500">Students with 65%–74.9% must pay an official university penalty fine with approved medical certificates. Below 65%, no fine is accepted and detention is mandatory.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-100 bg-white flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <h5 className="font-bold text-slate-900">Zero Attendance Internal Marks (0/5 Marks Loss)</h5>
                    <p className="text-[11px] text-slate-500">Dropping below 75% zeros out the continuous assessment attendance marks, lowering your GPA / CGPA by 0.3 to 0.5 points.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-100 bg-white flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <h5 className="font-bold text-slate-900">Campus Placement Disqualification</h5>
                    <p className="text-[11px] text-slate-500">Tier-1 recruiters (TCS, Zoho, Cognizant, etc.) mandate minimum 75% or 80% semester attendance criteria with zero detention history.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-100 bg-white flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                  <div>
                    <h5 className="font-bold text-slate-900">Semester Redo (Loss of 1 Academic Year)</h5>
                    <p className="text-[11px] text-slate-500">If overall attendance slips below 65%, the student is declared detained and must re-register and redo the entire semester next academic year.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COURSE-BY-COURSE MARKS TIER */}
          {activeTab === 'marks' && (
            <div className="mt-3 space-y-2">
              <div className="text-[11px] text-slate-500 pb-1">
                Anna University &amp; Autonomous Regulations Marks Allocation: <strong>≥90%: 5m</strong> | <strong>85-89%: 4m</strong> | <strong>80-84%: 3m</strong> | <strong>75-79%: 2m</strong> | <strong>&lt;75%: 0m</strong>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs">
                {subjects.map(s => {
                  const curMarks = getMarksForPct(s.currentPercentage);
                  const missed = s.sickDeduction || 0;
                  const credited = s.odCredit || 0;
                  const past = s.tPast || 15;
                  const curAtt = Math.round((s.currentPercentage / 100) * past);
                  const newCond = past + missed + credited;
                  const projPct = newCond > 0 ? ((curAtt + credited) / newCond) * 100 : s.currentPercentage;
                  const projMarks = getMarksForPct(projPct);
                  const isMarkDrop = projMarks < curMarks;

                  return (
                    <div key={s.id} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors">
                      <div>
                        <h6 className="font-extrabold text-slate-800 text-xs">{s.name}</h6>
                        <span className="text-[11px] text-slate-400">Current: {s.currentPercentage}% • Cutoff: 75%</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black ${
                          curMarks >= 4 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : (curMarks >= 2 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                        }`}>
                          {curMarks} / 5 Marks
                        </span>

                        {simulation.sickDays > 0 && isMarkDrop && (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                            ➔ {projMarks}/5 (-{curMarks - projMarks})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
