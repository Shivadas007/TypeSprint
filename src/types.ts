export type TestMode =
  | 'classic'
  | 'time-attack'
  | 'precision'
  | 'zen'
  | 'code'
  | 'word-sprint'
  | 'quote'
  | 'ai-challenge'
  | 'endless';

export type DifficultyLevel = 'easy' | 'moderate' | 'expert';

export type CodeLanguage = 'javascript' | 'python' | 'cpp' | 'html' | 'sql';

export type ThemeId = 'cosmic' | 'midnight' | 'cyber' | 'aurora' | 'light';

export interface TestResult {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  errors: number;
  totalEntries: number;
  wordsCompleted: number;
  timeTaken: number;
  targetDuration: number;
  mode: TestMode;
  level: DifficultyLevel;
  date: string;
  timestamp: number;
  wpmPerSecond: number[];
  keyStats?: Record<string, { total: number; errors: number; totalMs?: number }>;
  isPersonalBest?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  plan: 'free' | 'pro' | 'master';
  subscriptionStatus: 'none' | 'trialing' | 'active' | 'past_due' | 'cancelled';
  trialEndsAt?: string;
  avatarUrl: string;
  streak: number;
  longestStreak: number;
  xp: number;
  level: number;
  bestWpm: number;
  avgWpm: number;
  testsCompleted: number;
  themePreference: ThemeId;
  soundEnabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'speed' | 'accuracy' | 'streak' | 'endurance' | 'special';
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  targetMetric: 'wpm' | 'accuracy' | 'tests' | 'words';
  targetValue: number;
  currentValue: number;
  xpReward: number;
  completed: boolean;
}

export interface AiCoachDrill {
  drill: string;
  durationMinutes: number;
  targetWpm: number;
  description: string;
}

export interface AiCoachReport {
  biomechanicalSummary: string;
  keyWeaknesses: string[];
  fingerFatigueWarning: string;
  speedBottlenecks: string[];
  todaysTrainingPlan: AiCoachDrill[];
  nextSpeedMilestone: string;
}

export interface KeyHeatmapInfo {
  key: string;
  errorRate: number; // 0 to 1
  totalTyped: number;
  avgLatencyMs?: number;
  fingerZone: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
  hand: 'left' | 'right';
}
