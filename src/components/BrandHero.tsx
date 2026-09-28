'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, BookOpen, Layers, MapPin } from 'lucide-react';

interface BrandHeroProps {
  viewMode: 'split' | 'dashboard' | 'input';
  setViewMode: (mode: 'split' | 'dashboard' | 'input') => void;
  sectionDisplayName: string;
}

export const BrandHero: React.FC<BrandHeroProps> = ({ 
  viewMode, 
  setViewMode,
  sectionDisplayName 
}) => {
  return (
    <header className="pt-6 pb-4">
      {/* Top Navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
            <span className="text-xl">🎓</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                VibeCraft <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Attendance Predictor</span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                Live Timetable Model
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Calculate class targets, simulate leaves, and avoid irreversible detention.
            </p>
          </div>
        </div>

        {/* Section Pill & Layout Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            href="/locator"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 shadow-2xs transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Class Locator</span>
            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded-full font-extrabold">New</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{sectionDisplayName}</span>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Dashboard
            </button>
            <button
              type="button"
              onClick={() => setViewMode('input')}
              className={`sm:hidden px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'input'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Form
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
