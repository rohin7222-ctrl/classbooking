'use client';

import React from 'react';
import { SubjectInput } from '../types/attendance';
import { SECTION_OPTIONS } from '../data/timetableData';
import { 
  Layers, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  GraduationCap,
  Info 
} from 'lucide-react';

interface InputScreenProps {
  section: string;
  setSection: (val: string) => void;
  targetDate: string;
  setTargetDate: (val: string) => void;
  subjects: SubjectInput[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectInput[]>>;
  onPredict: () => void;
  isPredicting?: boolean;
}

export const InputScreen: React.FC<InputScreenProps> = ({
  section,
  setSection,
  targetDate,
  setTargetDate,
  subjects,
  setSubjects,
  onPredict,
  isPredicting = false,
}) => {
  const handleSubjectNameChange = (id: string, newName: string) => {
    setSubjects(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, name: newName } : sub))
    );
  };

  const handlePercentageChange = (id: string, value: string) => {
    const num = Math.min(100, Math.max(0, Number(value) || 0));
    setSubjects(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, currentPercentage: num } : sub))
    );
  };

  const setPresetPercentage = (id: string, pct: number) => {
    setSubjects(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, currentPercentage: pct } : sub))
    );
  };

  const handleAddSubject = () => {
    const nextIndex = subjects.length + 1;
    const newSubject: SubjectInput = {
      id: `subj-${Date.now()}`,
      name: `Elective ${nextIndex}`,
      currentPercentage: 75,
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects(prev => prev.filter(sub => sub.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xl shadow-slate-100/60 w-full transition-all">
      {/* Header with clear instructions */}
      <div className="flex items-start gap-3.5 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 flex-shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            1. Enter Your Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your section and enter your current percentage for each subject.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Section and Target Date Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Section Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Your Section
            </label>
            <div className="relative">
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                {SECTION_OPTIONS.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Target Date Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              Calculate Until Date
            </label>
            <input
              type="date"
              min="2026-09-28"
              max="2026-11-29"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Subjects List */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Subjects &amp; Current Attendance
              </span>
              <span className="text-xs text-slate-400 font-semibold">({subjects.length})</span>
            </div>
            <button
              type="button"
              onClick={handleAddSubject}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Course
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {subjects.map((subj, index) => {
              const isSafe = subj.currentPercentage >= 75;

              return (
                <div
                  key={subj.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl border transition-all ${
                    isSafe
                      ? 'bg-slate-50/60 border-slate-200/80 hover:border-emerald-300'
                      : 'bg-red-50/20 border-red-200/70 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-400 w-5 text-center flex-shrink-0">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={subj.name}
                      onChange={e => handleSubjectNameChange(subj.id, e.target.value)}
                      placeholder="Course Name"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all truncate"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    {/* Quick percentage helper presets */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPresetPercentage(subj.id, 65)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                          subj.currentPercentage === 65 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Set to 65% (Risk)"
                      >
                        65%
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetPercentage(subj.id, 75)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                          subj.currentPercentage === 75 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Set to 75% (Target)"
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetPercentage(subj.id, 85)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                          subj.currentPercentage === 85 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Set to 85% (Safe)"
                      >
                        85%
                      </button>
                    </div>

                    {/* Numeric Input */}
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={subj.currentPercentage === 0 ? '' : subj.currentPercentage}
                        onChange={e => handlePercentageChange(subj.id, e.target.value)}
                        placeholder="%"
                        className={`w-full bg-white border rounded-xl pl-2.5 pr-6 py-1.5 text-xs sm:text-sm font-extrabold focus:outline-none transition-all text-right ${
                          isSafe
                            ? 'border-slate-200 text-emerald-700 focus:border-emerald-500'
                            : 'border-red-200 text-red-700 focus:border-red-500'
                        }`}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                        %
                      </span>
                    </div>

                    {/* Delete button */}
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subj.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 cursor-pointer"
                        title="Remove course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predict Action Button */}
        <button
          type="button"
          onClick={onPredict}
          disabled={isPredicting}
          className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>{isPredicting ? 'Recalculating Metrics...' : 'Calculate My Targets'}</span>
        </button>
      </div>
    </div>
  );
};
