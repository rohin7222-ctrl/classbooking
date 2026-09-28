import { TIMETABLE_DATA, WeeklySchedule } from '../data/timetableData';
import { SubjectIconType, AttendanceStatus, SimulationSettings } from '../types/attendance';
import { getSubjectIconType } from './calculator';

export const SEMESTER_START_DATE = '2026-08-29';
export const CURRENT_DATE = '2026-09-28';
export const SEMESTER_END_DATE = '2026-11-29';
export const DEFAULT_TARGET_PERCENTAGE = 75;

export interface SubjectMetric {
  id: string;
  name: string;
  currentPercentage: number;
  targetPercentage: number;
  tPast: number;
  tFuture: number;
  tTotal: number;
  attendedClasses: number;
  requiredClassesToAttend: number;
  bunkableClasses: number;
  maxAchievablePercentage: number;
  status: AttendanceStatus;
  statusText: string;
  isIrreversibleDetention: boolean;
  iconType: SubjectIconType;
  odCredit: number;
  sickDeduction: number;
  maxAttendableFuture: number;
}

export interface AttendancePredictionResult {
  section: string;
  sectionDisplayName: string;
  targetDate: string;
  totalClassesRemainingSemester: number;
  totalClassesRemainingTarget: number;
  hasDetentionWarning: boolean;
  simulation: SimulationSettings;
  subjects: SubjectMetric[];
  statusCounts: {
    safe: number;
    warning: number;
    danger: number;
    detention: number;
  };
}

/**
 * Counts total scheduled periods for each subject between two dates (inclusive)
 * using the section's weekly schedule [Mon, Tue, Wed, Thu, Fri].
 */
export function countClassesBetweenDates(
  schedule: WeeklySchedule,
  startDateStr: string,
  endDateStr: string
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const subject of Object.keys(schedule)) {
    counts[subject] = 0;
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start > end) return counts;

  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    
    // Ignore weekends
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const weekdayIndex = dayOfWeek - 1; // 0 for Mon to 4 for Fri
      for (const [subject, periodsPerDay] of Object.entries(schedule)) {
        counts[subject] += periodsPerDay[weekdayIndex] || 0;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return counts;
}

/**
 * Helper to get the next day string 'YYYY-MM-DD'
 */
function getNextDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Core Calculator: Calculates T_past, T_future, T_total, and required classes to attend.
 * Incorporates OD (On-Duty) and Sick Leave simulations!
 */
export function calculateAttendanceMetrics(
  sectionKey: string,
  targetDateStr: string = SEMESTER_END_DATE,
  userPercentages: Record<string, number> = {},
  targetPercentage: number = DEFAULT_TARGET_PERCENTAGE,
  simulation: SimulationSettings = { odDays: 0, sickDays: 0 }
): AttendancePredictionResult {
  const schedule = TIMETABLE_DATA[sectionKey] || TIMETABLE_DATA['IV_ECE_B'];

  // T_past: Classes from Semester Start to Current Date (inclusive)
  const pastCounts = countClassesBetweenDates(schedule, SEMESTER_START_DATE, CURRENT_DATE);

  // T_future: Classes from day after Current Date to Target Date (inclusive)
  const futureStartDate = getNextDay(CURRENT_DATE);
  const futureCounts = countClassesBetweenDates(schedule, futureStartDate, targetDateStr);

  // Remaining in full semester
  const semesterRemainingCounts = countClassesBetweenDates(schedule, futureStartDate, SEMESTER_END_DATE);

  let totalClassesRemainingTarget = 0;
  let totalClassesRemainingSemester = 0;
  let hasDetentionWarning = false;

  const statusCounts = {
    safe: 0,
    warning: 0,
    danger: 0,
    detention: 0,
  };

  const subjects: SubjectMetric[] = Object.keys(schedule).map((subjName, index) => {
    const tPast = pastCounts[subjName] || 0;
    const tFuture = futureCounts[subjName] || 0;
    const tTotal = tPast + tFuture;
    const tSemRemaining = semesterRemainingCounts[subjName] || 0;

    totalClassesRemainingTarget += tFuture;
    totalClassesRemainingSemester += tSemRemaining;

    // Current Percentage
    const currentPercentage = userPercentages[subjName] !== undefined
      ? userPercentages[subjName]
      : [65, 72, 82, 70, 78, 60, 85, 75][index % 8];

    // Estimated attended classes so far
    const baseAttended = tPast > 0 ? Math.round((currentPercentage / 100) * tPast) : 0;

    // --- LEAVE & OD SIMULATION LOGIC ---
    // Average periods per day for this subject
    const weeklyPeriods = schedule[subjName] ? schedule[subjName].reduce((a, b) => a + b, 0) : 0;
    const avgPeriodsPerDay = weeklyPeriods / 5.0;

    // OD: Classes on OD days are officially credited as "Attended"
    const odCredit = Math.min(tFuture, Math.round(simulation.odDays * avgPeriodsPerDay));
    const effectiveAttended = baseAttended + odCredit;

    // Sick Leave: Classes on Sick days are missed (counted as "Absent")
    const sickDeduction = Math.min(tFuture, Math.round(simulation.sickDays * avgPeriodsPerDay));
    // The maximum future classes student is physically able to attend
    const maxAttendableFuture = Math.max(0, tFuture - sickDeduction);

    // Total required attendance count by target date to reach target %
    const requiredOverallAttended = Math.ceil((targetPercentage / 100) * tTotal);

    // Additional future classes student MUST attend
    const needed = Math.max(0, requiredOverallAttended - effectiveAttended);

    // Max achievable attendance percentage if student attends 100% of available future classes
    const maxPossibleAttended = effectiveAttended + maxAttendableFuture;
    const maxAchievable = tTotal > 0
      ? Math.min(100, Math.round((maxPossibleAttended / tTotal) * 100))
      : 100;

    const isIrreversible = maxAchievable < targetPercentage || needed > maxAttendableFuture;

    let status: AttendanceStatus = 'safe';
    let statusText = 'You are on track! Keep it up.';
    let bunkable = 0;

    if (isIrreversible) {
      status = 'detention';
      statusCounts.detention++;
      hasDetentionWarning = true;
      if (simulation.sickDays > 0) {
        statusText = `Detention Alert! Due to ${simulation.sickDays} sick leave(s), max achievable is only ${maxAchievable}%.`;
      } else {
        statusText = `Irreversible Detention! Max achievable attendance is ${maxAchievable}%.`;
      }
    } else if (needed === 0) {
      status = 'safe';
      statusCounts.safe++;
      bunkable = maxPossibleAttended - requiredOverallAttended;
      if (odCredit > 0) {
        statusText = `On Track! (+${odCredit} classes credited via OD). You can safely miss up to ${bunkable} classes.`;
      } else {
        statusText = bunkable > 0 
          ? `You are on track! You can safely miss up to ${bunkable} classes.`
          : `You are on track! Keep it up.`;
      }
    } else {
      // Must attend some future classes
      const attendanceRatioNeeded = maxAttendableFuture > 0 ? needed / maxAttendableFuture : 1;
      if (attendanceRatioNeeded >= 0.70 || currentPercentage < targetPercentage) {
        status = 'danger';
        statusCounts.danger++;
        hasDetentionWarning = true;
      } else {
        status = 'warning';
        statusCounts.warning++;
      }

      const odText = odCredit > 0 ? ` (+${odCredit} credited via OD)` : '';
      statusText = `You MUST attend ${needed} out of ${maxAttendableFuture} available remaining classes${odText}.`;
    }

    return {
      id: `subj-${index + 1}`,
      name: subjName,
      currentPercentage,
      targetPercentage,
      tPast,
      tFuture,
      tTotal,
      attendedClasses: effectiveAttended,
      requiredClassesToAttend: needed,
      bunkableClasses: bunkable,
      maxAchievablePercentage: maxAchievable,
      status,
      statusText,
      isIrreversibleDetention: isIrreversible,
      iconType: getSubjectIconType(subjName),
      odCredit,
      sickDeduction,
      maxAttendableFuture,
    };
  });

  return {
    section: sectionKey,
    sectionDisplayName: sectionKey.replace(/_/g, ' '),
    targetDate: targetDateStr,
    totalClassesRemainingSemester,
    totalClassesRemainingTarget,
    hasDetentionWarning,
    simulation,
    subjects,
    statusCounts,
  };
}
