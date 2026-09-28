'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { SubjectMetric } from '../utils/attendanceCalculator';

interface AttendanceChartsProps {
  subjects: SubjectMetric[];
}

const STATUS_COLORS = {
  Safe: '#10b981',       // Emerald
  Warning: '#f59e0b',    // Amber
  Danger: '#ef4444',     // Red
  Detention: '#dc2626', // Deep Red
};

export const AttendanceCharts: React.FC<AttendanceChartsProps> = ({ subjects }) => {
  // Aggregate data for the Donut Chart
  const statusCounts = subjects.reduce(
    (acc, subj) => {
      if (subj.status === 'detention') acc.Detention++;
      else if (subj.status === 'danger') acc.Danger++;
      else if (subj.status === 'warning') acc.Warning++;
      else acc.Safe++;
      return acc;
    },
    { Safe: 0, Warning: 0, Danger: 0, Detention: 0 }
  );

  const donutData = [
    { name: 'Safe', value: statusCounts.Safe, color: STATUS_COLORS.Safe },
    { name: 'Warning', value: statusCounts.Warning, color: STATUS_COLORS.Warning },
    { name: 'Danger', value: statusCounts.Danger, color: STATUS_COLORS.Danger },
    { name: 'Detention', value: statusCounts.Detention, color: STATUS_COLORS.Detention },
  ].filter(d => d.value > 0);

  // Bar Chart Data: Current % vs Target 75% vs Target 90%
  const barData = subjects.map(s => ({
    name: s.name.length > 14 ? s.name.substring(0, 12) + '...' : s.name,
    fullName: s.name,
    Current: s.currentPercentage,
    'Target 75%': 75,
    'Target 90%': 90,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            📊 Attendance Health &amp; Analytics
          </h3>
          <p className="text-xs text-slate-400">
            Interactive breakdown of subject health zones and target goals
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {statusCounts.Safe} Safe
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            {statusCounts.Warning} Warning
          </span>
          <span className="flex items-center gap-1 font-semibold text-red-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            {statusCounts.Danger + statusCounts.Detention} Danger / Detention
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut Chart: Subject Zones */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-2 bg-slate-50/60 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-600 mb-2">Subject Risk Distribution</h4>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val} Subject(s)`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Current vs 75% vs 90% */}
        <div className="lg:col-span-8 p-2 bg-slate-50/60 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-600 mb-2 px-2">
            Current % vs Target (75%) vs Target (90%)
          </h4>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val, name) => [`${val}%`, name]}
                  labelFormatter={(name, payload) => payload?.[0]?.payload?.fullName || name}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />
                <Bar dataKey="Current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target 75%" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target 90%" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
