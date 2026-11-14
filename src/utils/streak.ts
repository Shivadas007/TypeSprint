import { TestResult } from '../types';

/**
 * Format a Date object to local YYYY-MM-DD
 */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface RealtimeStreakData {
  currentStreak: number;
  longestStreak: number;
  hasTestedToday: boolean;
  totalActiveDays: number;
  weekDays: {
    dayName: string;
    dateKey: string;
    isActive: boolean;
    isToday: boolean;
    isPast: boolean;
  }[];
}

/**
 * Calculates genuine real-time streak, longest streak, and current week's activity
 * from actual user test results history.
 */
export function calculateRealtimeStreak(results: TestResult[] = []): RealtimeStreakData {
  if (!results || results.length === 0) {
    const now = new Date();
    const todayIdx = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - todayIdx);
    monday.setHours(0, 0, 0, 0);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const isToday = idx === todayIdx;
      return {
        dayName: name,
        dateKey: toDateKey(d),
        isActive: false,
        isToday,
        isPast: idx < todayIdx,
      };
    });

    return {
      currentStreak: 0,
      longestStreak: 0,
      hasTestedToday: false,
      totalActiveDays: 0,
      weekDays,
    };
  }

  // Collect unique calendar days when tests were performed
  const uniqueDateKeys = new Set<string>();

  for (const r of results) {
    if (r.timestamp) {
      uniqueDateKeys.add(toDateKey(new Date(r.timestamp)));
    } else if (r.date) {
      // Fallback parse if timestamp is absent
      const parsed = new Date(r.date);
      if (!isNaN(parsed.getTime())) {
        uniqueDateKeys.add(toDateKey(parsed));
      }
    }
  }

  const now = new Date();
  const todayKey = toDateKey(now);
  const hasTestedToday = uniqueDateKeys.has(todayKey);

  // Compute Current Streak
  let currentStreak = 0;
  const checkDate = new Date(now);

  if (hasTestedToday) {
    // Count backwards from today
    while (uniqueDateKeys.has(toDateKey(checkDate))) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    // Check if yesterday had activity; if so, streak is alive and counts backwards from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    while (uniqueDateKeys.has(toDateKey(checkDate))) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Compute Longest Streak across all historical dates
  const sortedDates = Array.from(uniqueDateKeys).sort();
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDateMs: number | null = null;

  for (const dateKey of sortedDates) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);
    const currentMs = currentDate.getTime();

    if (prevDateMs === null) {
      runningStreak = 1;
    } else {
      // Check if this date is exactly 1 calendar day after prevDateMs
      const diffDays = Math.round((currentMs - prevDateMs) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak += 1;
      } else {
        runningStreak = 1;
      }
    }

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDateMs = currentMs;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Calculate current week days (Monday - Sunday)
  const todayIdx = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayIdx);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDays = dayNames.map((name, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateKey = toDateKey(d);
    const isToday = idx === todayIdx;
    const isPast = idx < todayIdx;
    const isActive = uniqueDateKeys.has(dateKey);

    return {
      dayName: name,
      dateKey,
      isActive,
      isToday,
      isPast,
    };
  });

  return {
    currentStreak,
    longestStreak,
    hasTestedToday,
    totalActiveDays: uniqueDateKeys.size,
    weekDays,
  };
}
