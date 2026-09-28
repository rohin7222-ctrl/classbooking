'use client';

import React from 'react';
import { SubjectPrediction, SubjectIconType, AttendanceStatus } from '../types/attendance';
import { 
  ChevronsRight, 
  Settings, 
  Database, 
  Share2, 
  Code2, 
  Laptop, 
  BookOpen,
  CheckCircle2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

interface SubjectCardProps {
  subject: SubjectPrediction;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const getSubjectIcon = (type: SubjectIconType) => {
    switch (type) {
      case 'data-structures':
        return <ChevronsRight className="w-4 h-4 stroke-[2.5]" />;
      case 'operating-systems':
        return <Settings className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'networks':
        return <Share2 className="w-4 h-4" />;
      case 'web':
        return <Code2 className="w-4 h-4" />;
      case 'software-engineering':
        return <Laptop className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTheme = (status: AttendanceStatus) => {
    switch (status) {
      case 'detention':
        return {
          cardBorder: 'border-red-300 hover:border-red-400 bg-red-50/20',
          iconBox: 'bg-red-100 text-red-700',
          badgeText: 'text-red-700 bg-red-100 border-red-200',
          barColor: 'bg-red-600',
          bannerBg: 'bg-red-100/80 text-red-800 border border-red-200',
          label: 'Detention Risk',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      case 'danger':
        return {
          cardBorder: 'border-red-200 hover:border-red-300 bg-white',
          iconBox: 'bg-red-100 text-red-600',
          badgeText: 'text-red-600 bg-red-50 border-red-200',
          barColor: 'bg-red-500',
          bannerBg: 'bg-red-50 text-red-700 border border-red-100',
          label: 'Danger Zone',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      case 'warning':
        return {
          cardBorder: 'border-amber-200 hover:border-amber-300 bg-white',
          iconBox: 'bg-amber-100 text-amber-600',
          badgeText: 'text-amber-700 bg-amber-50 border-amber-200',
          barColor: 'bg-amber-500',
          bannerBg: 'bg-amber-50 text-amber-800 border border-amber-100',
          label: 'Warning',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      case 'safe':
      default:
        return {
          cardBorder: 'border-emerald-200 hover:border-emerald-300 bg-white',
          iconBox: 'bg-emerald-100 text-emerald-600',
          badgeText: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          barColor: 'bg-emerald-500',
          bannerBg: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
          label: 'Safe',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
    }
  };

  const theme = getTheme(subject.status);
  const currentPct = Math.min(100, Math.max(0, subject.currentPercentage));
  const internalMarks = currentPct >= 90 ? 5 : currentPct >= 85 ? 4 : currentPct >= 80 ? 3 : currentPct >= 75 ? 2 : 0;

  return (
    <div className={`rounded-2xl border ${theme.cardBorder} p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}>
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.iconBox}`}>
              {getSubjectIcon(subject.iconType)}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate">
                {subject.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-slate-400 font-medium">
                  Cutoff: {subject.targetPercentage}%
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  internalMarks >= 4 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : (internalMarks >= 2 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200')
                }`}>
                  {internalMarks}/5 Marks
                </span>
              </div>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${theme.badgeText} flex-shrink-0`}>
            {theme.icon}
            <span>{theme.label}</span>
          </div>
        </div>

        {/* Visual Progress Bar with 75% Cutoff Marker */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-700">Current: {subject.currentPercentage}%</span>
            <span className="text-[11px] text-slate-400 font-medium">Cutoff: 75%</span>
          </div>
          
          <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            {/* 75% goal marker line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10 opacity-70"
              style={{ left: '75%' }}
              title="75% Attendance Threshold"
            />
            {/* Fill bar */}
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${theme.barColor}`}
              style={{ width: `${currentPct}%` }}
            />
          </div>
        </div>

        {/* Timetable Numbers Breakdown */}
        {subject.tPast !== undefined && subject.tFuture !== undefined && (
          <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-100 rounded-xl p-2 text-center text-[11px] mb-3">
            <div>
              <span className="block text-slate-400 text-[10px]">Held</span>
              <strong className="text-slate-800 font-bold">{subject.tPast}</strong>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">Future</span>
              <strong className="text-slate-800 font-bold">{subject.tFuture}</strong>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">Total</span>
              <strong className="text-slate-800 font-bold">{subject.tTotal}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Requirement message box */}
      <div className={`rounded-xl p-3 text-xs font-medium leading-relaxed ${theme.bannerBg}`}>
        {subject.statusText}
      </div>
    </div>
  );
};
