export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface RoomSchedule {
  room: string;
  floor: string;
  isAC: boolean;
  occupied: Record<DayOfWeek, number[]>;
}

export interface PeriodInfo {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  timeRange: string;
}

export const PERIOD_TIMINGS: PeriodInfo[] = [
  { period: 1, label: "Period 1", startTime: "09:00", endTime: "09:50", timeRange: "09:00 AM - 09:50 AM" },
  { period: 2, label: "Period 2", startTime: "09:50", endTime: "10:40", timeRange: "09:50 AM - 10:40 AM" },
  { period: 3, label: "Period 3", startTime: "10:40", endTime: "11:30", timeRange: "10:40 AM - 11:30 AM" },
  { period: 4, label: "Period 4", startTime: "11:30", endTime: "12:20", timeRange: "11:30 AM - 12:20 PM" },
  { period: 5, label: "Period 5", startTime: "12:40", endTime: "13:30", timeRange: "12:40 PM - 01:30 PM" },
  { period: 6, label: "Period 6", startTime: "13:30", endTime: "14:20", timeRange: "01:30 PM - 02:20 PM" },
  { period: 7, label: "Period 7", startTime: "14:20", endTime: "15:10", timeRange: "02:20 PM - 03:10 PM" },
  { period: 8, label: "Period 8", startTime: "15:10", endTime: "16:00", timeRange: "03:10 PM - 04:00 PM" },
  { period: 9, label: "Period 9", startTime: "16:00", endTime: "16:50", timeRange: "04:00 PM - 04:50 PM" },
];

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const ROOM_DATA: RoomSchedule[] = [
  { room: "IST 227", floor: "2nd Floor", isAC: true, occupied: { Monday: [1,1,1,1,1,0,0,0,0], Tuesday: [1,1,1,1,1,1,0,0,0], Wednesday: [1,1,1,1,0,0,0,0,0], Thursday: [1,1,1,0,1,1,1,0,0], Friday: [1,1,0,1,0,0,0,0,0] } },
  { room: "IST 225", floor: "2nd Floor", isAC: true, occupied: { Monday: [1,1,1,1,0,0,0,0,0], Tuesday: [1,1,1,1,0,0,0,0,0], Wednesday: [1,1,0,1,1,0,0,0,0], Thursday: [1,1,1,1,0,0,0,0,0], Friday: [1,1,1,1,0,0,0,0,0] } },
  { room: "IST 211", floor: "2nd Floor", isAC: false, occupied: { Monday: [0,0,0,0,1,1,1,1,0], Tuesday: [0,0,0,0,1,1,1,1,0], Wednesday: [0,0,0,0,1,1,1,1,0], Thursday: [0,0,0,0,1,1,1,1,0], Friday: [0,0,0,0,1,1,1,1,0] } },
  { room: "IST 416", floor: "4th Floor", isAC: true, occupied: { Monday: [1,1,1,0,0,0,0,0,0], Tuesday: [1,1,1,1,0,1,0,0,0], Wednesday: [1,1,0,1,0,1,0,0,0], Thursday: [1,1,0,1,0,1,0,0,0], Friday: [1,1,0,1,0,1,0,0,0] } },
  { room: "IST 411", floor: "4th Floor", isAC: true, occupied: { Monday: [0,0,0,0,1,1,1,1,0], Tuesday: [0,0,0,0,1,1,1,1,0], Wednesday: [0,0,0,0,1,1,1,1,0], Thursday: [0,0,0,0,1,1,1,1,0], Friday: [0,0,0,0,1,1,1,1,0] } },
  { room: "IST 518", floor: "5th Floor", isAC: true, occupied: { Monday: [1,1,1,1,1,1,1,1,1], Tuesday: [1,1,1,1,1,1,1,1,1], Wednesday: [1,1,1,1,1,1,1,1,1], Thursday: [1,1,1,1,1,1,1,1,1], Friday: [1,1,1,1,1,1,1,1,1] } },
  { room: "IST 519", floor: "5th Floor", isAC: false, occupied: { Monday: [1,1,1,1,1,1,0,0,0], Tuesday: [1,1,1,1,1,1,0,0,0], Wednesday: [1,1,1,1,1,1,0,0,0], Thursday: [1,1,1,1,1,1,0,0,0], Friday: [1,1,1,1,1,1,0,0,0] } },
  { room: "IST 602", floor: "6th Floor", isAC: true, occupied: { Monday: [1,1,1,1,1,1,1,1,1], Tuesday: [1,1,1,1,1,1,1,1,1], Wednesday: [1,1,1,1,1,1,1,1,1], Thursday: [1,1,1,1,1,1,1,1,1], Friday: [1,1,1,1,1,1,1,1,1] } },
  { room: "IST 710", floor: "7th Floor", isAC: false, occupied: { Monday: [1,0,0,1,1,1,0,0,0], Tuesday: [1,0,0,1,1,1,0,0,0], Wednesday: [1,0,0,1,1,1,0,0,0], Thursday: [1,0,0,1,1,1,0,0,0], Friday: [1,0,0,1,1,1,0,0,0] } },
  { room: "IST 108 (Lab)", floor: "Ground Floor", isAC: true, occupied: { Monday: [0,0,0,0,0,0,1,1,1], Tuesday: [0,0,0,0,0,0,1,1,1], Wednesday: [0,0,0,0,0,0,1,1,1], Thursday: [0,0,0,0,0,0,1,1,1], Friday: [0,0,0,0,0,0,1,1,1] } }
];

/**
 * Calculates how many consecutive periods a room remains free starting from startPeriod (0-indexed 0..8).
 */
export function getConsecutiveFreePeriods(room: RoomSchedule, day: DayOfWeek, startPeriodIndex: number): number {
  const schedule = room.occupied[day] || [];
  if (schedule[startPeriodIndex] !== 0) return 0;
  
  let count = 0;
  for (let i = startPeriodIndex; i < schedule.length; i++) {
    if (schedule[i] === 0) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Gets next upcoming free period index if currently occupied, or -1 if no free period remaining.
 */
export function getNextFreePeriodIndex(room: RoomSchedule, day: DayOfWeek, currentPeriodIndex: number): number {
  const schedule = room.occupied[day] || [];
  for (let i = currentPeriodIndex + 1; i < schedule.length; i++) {
    if (schedule[i] === 0) return i;
  }
  return -1;
}

/**
 * Gets total free periods count for the day.
 */
export function getTotalFreePeriods(room: RoomSchedule, day: DayOfWeek): number {
  const schedule = room.occupied[day] || [];
  return schedule.filter(slot => slot === 0).length;
}

/**
 * Helper to get the current period (1..9) based on current clock time.
 * If outside schedule hours, defaults to 1.
 */
export function getCurrentPeriodFromTime(date: Date = new Date()): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 09:00 = 540m, 16:50 = 1010m (50 mins each, starting at 9 AM)
  const periodMinuteBounds = [
    { period: 1, start: 9 * 60 + 0, end: 9 * 60 + 50 },
    { period: 2, start: 9 * 60 + 50, end: 10 * 60 + 40 },
    { period: 3, start: 10 * 60 + 40, end: 11 * 60 + 30 },
    { period: 4, start: 11 * 60 + 30, end: 12 * 60 + 20 },
    { period: 5, start: 12 * 60 + 40, end: 13 * 60 + 30 }, // After 20m lunch
    { period: 6, start: 13 * 60 + 30, end: 14 * 60 + 20 },
    { period: 7, start: 14 * 60 + 20, end: 15 * 60 + 10 },
    { period: 8, start: 15 * 60 + 10, end: 16 * 60 + 0 },
    { period: 9, start: 16 * 60 + 0, end: 16 * 60 + 50 },
  ];

  for (const p of periodMinuteBounds) {
    if (totalMinutes >= p.start && totalMinutes < p.end) {
      return p.period;
    }
  }

  // If before 9 AM
  if (totalMinutes < periodMinuteBounds[0].start) return 1;
  // If after 4:50 PM
  if (totalMinutes >= periodMinuteBounds[periodMinuteBounds.length - 1].end) return 9;

  // Lunch / Break interval: return next upcoming period
  for (let i = 0; i < periodMinuteBounds.length - 1; i++) {
    if (totalMinutes >= periodMinuteBounds[i].end && totalMinutes < periodMinuteBounds[i + 1].start) {
      return periodMinuteBounds[i + 1].period;
    }
  }

  return 1;
}

/**
 * Returns exact Date timestamp for when a period ends on the given date (default today).
 */
export function getPeriodEndTime(periodNumber: number, baseDate: Date = new Date()): Date {
  const timing = PERIOD_TIMINGS.find(p => p.period === periodNumber) || PERIOD_TIMINGS[PERIOD_TIMINGS.length - 1];
  const [hh, mm] = timing.endTime.split(':').map(Number);
  
  const target = new Date(baseDate);
  target.setHours(hh, mm, 0, 0);
  return target;
}

/**
 * Returns current day of week (Monday..Friday). If Saturday/Sunday, defaults to Monday.
 */
export function getCurrentDayOfWeek(date: Date = new Date()): DayOfWeek {
  const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  switch (dayIndex) {
    case 1: return 'Monday';
    case 2: return 'Tuesday';
    case 3: return 'Wednesday';
    case 4: return 'Thursday';
    case 5: return 'Friday';
    default: return 'Monday'; // Default weekend to Monday
  }
}
