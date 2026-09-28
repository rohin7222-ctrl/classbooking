'use client';

import React from 'react';
import { AttendanceStatus } from '../types/attendance';

interface CircularProgressProps {
  percentage: number;
  status: AttendanceStatus;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  status,
  size = 64,
  strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  const colorMap = {
    safe: {
      stroke: '#10b981', // emerald-500
      bg: '#d1fae5',     // emerald-100
      text: 'text-emerald-700',
    },
    warning: {
      stroke: '#f59e0b', // amber-500
      bg: '#fef3c7',     // amber-100
      text: 'text-amber-700',
    },
    danger: {
      stroke: '#ef4444', // red-500
      bg: '#fee2e2',     // red-100
      text: 'text-red-700',
    },
    detention: {
      stroke: '#dc2626', // red-600
      bg: '#fecaca',     // red-200
      text: 'text-red-800',
    },
  };

  const colors = colorMap[status] || colorMap.safe;

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bg}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={`absolute text-xs font-bold ${colors.text}`}>
        {clampedPercentage}%
      </span>
    </div>
  );
};
