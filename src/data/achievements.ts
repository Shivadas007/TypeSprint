import { Achievement, TestResult, UserProfile } from '../types';

export const initialAchievements: Achievement[] = [
  {
    id: 'first_sprint',
    title: 'First Sprint',
    description: 'Complete your first typing session on Type Sprint.',
    iconName: 'Zap',
    category: 'speed',
    xpReward: 100,
    isUnlocked: false,
  },
  {
    id: 'speed_60',
    title: 'Flow State',
    description: 'Break 60 WPM in any verified test mode.',
    iconName: 'Flame',
    category: 'speed',
    xpReward: 200,
    isUnlocked: false,
  },
  {
    id: 'speed_80',
    title: 'Sonic Velocity',
    description: 'Break 80 WPM with at least 95% accuracy.',
    iconName: 'Activity',
    category: 'speed',
    xpReward: 350,
    isUnlocked: false,
  },
  {
    id: 'speed_100',
    title: 'Century Club',
    description: 'Reach 100 WPM in a test of 30 seconds or longer.',
    iconName: 'Award',
    category: 'speed',
    xpReward: 600,
    isUnlocked: false,
  },
  {
    id: 'speed_120',
    title: 'Hypersonic',
    description: 'Surpass 120 WPM with surgical precision.',
    iconName: 'Rocket',
    category: 'speed',
    xpReward: 1000,
    isUnlocked: false,
  },
  {
    id: 'speed_150',
    title: 'Cosmic Legend',
    description: 'Break 150 WPM — entering elite grandmaster tier.',
    iconName: 'Crown',
    category: 'speed',
    xpReward: 2500,
    isUnlocked: false,
  },
  {
    id: 'sniper_accuracy',
    title: 'Deadly Precision',
    description: 'Finish a 30s+ test with flawless 100% accuracy.',
    iconName: 'Target',
    category: 'accuracy',
    xpReward: 400,
    isUnlocked: false,
  },
  {
    id: 'code_master',
    title: 'Syntax Master',
    description: 'Complete a Code Mode sprint with over 60 WPM and 96% accuracy.',
    iconName: 'Code',
    category: 'special',
    xpReward: 450,
    isUnlocked: false,
  },
  {
    id: 'streak_7',
    title: '7-Day Kinetic Habit',
    description: 'Maintain a typing streak for 7 consecutive days.',
    iconName: 'Calendar',
    category: 'streak',
    xpReward: 500,
    isUnlocked: false,
  },
  {
    id: 'tests_100',
    title: 'Century Veteran',
    description: 'Complete 100 total typing tests on the platform.',
    iconName: 'CheckCircle2',
    category: 'endurance',
    xpReward: 800,
    isUnlocked: false,
  },
  {
    id: 'zen_master',
    title: 'Zen Mind',
    description: 'Complete a 60s test in Zen Mode with 90%+ consistency.',
    iconName: 'Compass',
    category: 'special',
    xpReward: 300,
    isUnlocked: false,
  },
  {
    id: 'night_owl',
    title: 'Night Runner',
    description: 'Complete a sprint during late night hours (11 PM - 4 AM).',
    iconName: 'Moon',
    category: 'special',
    xpReward: 250,
    isUnlocked: false,
  }
];

export function checkAchievements(
  currentList: Achievement[],
  latestResult: TestResult,
  profile: UserProfile,
  allResults: TestResult[]
): { updatedList: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  const updatedList = currentList.map((ach) => {
    if (ach.isUnlocked) return ach;

    let shouldUnlock = false;

    switch (ach.id) {
      case 'first_sprint':
        shouldUnlock = true;
        break;
      case 'speed_60':
        shouldUnlock = latestResult.wpm >= 60;
        break;
      case 'speed_80':
        shouldUnlock = latestResult.wpm >= 80 && latestResult.accuracy >= 95;
        break;
      case 'speed_100':
        shouldUnlock = latestResult.wpm >= 100 && latestResult.targetDuration >= 30;
        break;
      case 'speed_120':
        shouldUnlock = latestResult.wpm >= 120;
        break;
      case 'speed_150':
        shouldUnlock = latestResult.wpm >= 150;
        break;
      case 'sniper_accuracy':
        shouldUnlock = latestResult.accuracy === 100 && latestResult.targetDuration >= 30;
        break;
      case 'code_master':
        shouldUnlock = latestResult.mode === 'code' && latestResult.wpm >= 60 && latestResult.accuracy >= 96;
        break;
      case 'streak_7':
        shouldUnlock = profile.streak >= 7;
        break;
      case 'tests_100':
        shouldUnlock = (profile.testsCompleted + 1) >= 100 || allResults.length >= 100;
        break;
      case 'zen_master':
        shouldUnlock = latestResult.mode === 'zen' && latestResult.consistency >= 90 && latestResult.targetDuration >= 60;
        break;
      case 'night_owl':
        shouldUnlock = currentHour >= 23 || currentHour <= 4;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      const unlockedAch: Achievement = {
        ...ach,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      newlyUnlocked.push(unlockedAch);
      return unlockedAch;
    }

    return ach;
  });

  return { updatedList, newlyUnlocked };
}
