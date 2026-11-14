import React from 'react';
import { Flame, Trophy, Calendar, Zap, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { UserProfile, TestResult } from '../types';
import { calculateRealtimeStreak } from '../utils/streak';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  results: TestResult[];
  onStartPractice: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  user,
  results,
  onStartPractice,
}) => {
  if (!isOpen) return null;

  const streakData = calculateRealtimeStreak(results);
  const currentStreak = streakData.currentStreak;
  const longestStreak = streakData.longestStreak;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#070e24] border border-orange-500/35 rounded-3xl p-7 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Flame Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-orange-500/20 mb-4">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            <span>Kinetic Streak Engine (Live Telemetry)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg px-1.5"
          >
            ✕
          </button>
        </div>

        {/* Giant Flame Counter Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#180e07] via-[#0e1227] to-[#060c1d] border border-orange-500/30 text-center flex flex-col items-center shadow-[0_0_30px_rgba(249,115,22,0.15)] mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 mb-2 shadow-[0_0_20px_rgba(249,115,22,0.45)]">
            <div className="w-full h-full rounded-full bg-[#05091a] flex items-center justify-center">
              <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'text-orange-400 animate-pulse' : 'text-slate-500'}`} />
            </div>
          </div>

          <div className="my-1">
            <span className="text-5xl font-black font-mono text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">
              {currentStreak} {currentStreak === 1 ? 'DAY' : 'DAYS'}
            </span>
          </div>
          <span className="text-xs uppercase font-mono tracking-wider text-orange-300 font-bold">
            {streakData.hasTestedToday
              ? 'Flame Burning Hot · Trained Today'
              : currentStreak > 0
              ? 'Pending Today · Take a Sprint to Maintain'
              : 'Start Your Streak Today'}
          </span>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
            {currentStreak > 0
              ? `You have trained your fingers for ${currentStreak} consecutive ${currentStreak === 1 ? 'day' : 'days'} based on your verified test logs.`
              : 'Complete at least 1 typing test every 24 hours to build and maintain your kinetic momentum!'}
          </p>
        </div>

        {/* Weekly Habit Tracker */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>This Week's Activity (Real-time)</span>
            <span className="text-emerald-400 font-bold">
              {streakData.weekDays.filter((d) => d.isActive).length} / 7 Days Active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {streakData.weekDays.map((day) => {
              return (
                <div
                  key={day.dateKey}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between h-14 transition-all ${
                    day.isToday && day.isActive
                      ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                      : day.isActive
                      ? 'bg-slate-900 border-emerald-500/40 text-emerald-400'
                      : day.isToday
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 animate-pulse'
                      : day.isPast
                      ? 'bg-slate-900/50 border-slate-800 text-slate-500'
                      : 'bg-slate-900/30 border-slate-800/60 text-slate-600'
                  }`}
                  title={`${day.dayName} (${day.dateKey}): ${day.isActive ? 'Active' : day.isToday ? 'Pending test today' : day.isPast ? 'No test recorded' : 'Upcoming'}`}
                >
                  <span className="text-[10px] font-mono uppercase font-bold">{day.dayName}</span>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center">
                    {day.isActive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : day.isToday ? (
                      <Flame className="w-3 h-3 text-orange-400 animate-bounce" />
                    ) : day.isPast ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block uppercase text-[10px]">Longest Streak</span>
            <span className="text-lg font-bold text-slate-200">{longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block uppercase text-[10px]">Total Active Days</span>
            <span className="text-lg font-bold text-amber-400">{streakData.totalActiveDays} {streakData.totalActiveDays === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onStartPractice();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-slate-950" />
          <span>{streakData.hasTestedToday ? 'Keep Practicing · Launch Sprint' : 'Ignite Streak · Launch Sprint'}</span>
        </button>
      </div>
    </div>
  );
};
