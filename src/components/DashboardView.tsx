import React, { useState } from 'react';
import { UserProfile, TestResult, Achievement } from '../types';
import { Flame, Trophy, Activity, Target, Zap, Clock, Calendar, Search, ArrowUpRight, Award, Brain } from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  results: TestResult[];
  achievements: Achievement[];
  onStartTest: () => void;
  onNavigateToAiCoach: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  results,
  achievements,
  onStartTest,
  onNavigateToAiCoach,
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  // Filtered recent tests
  const filteredResults = results
    .filter((r) => filterMode === 'all' || r.mode === filterMode)
    .filter((r) => r.mode.toLowerCase().includes(searchTerm.toLowerCase()) || r.date.includes(searchTerm));

  // Compute stats strictly from real cached results
  const totalTests = results.length;
  const bestWpm = results.length > 0 ? Math.max(...results.map((r) => r.wpm)) : (user.bestWpm || 0);
  const avgWpm =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / results.length)
      : (user.avgWpm || 0);
  const avgAccuracy =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / results.length)
      : 0;
  const avgConsistency =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.consistency, 0) / results.length)
      : 0;

  // Unlocked achievements count
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-10 sm:pb-12 animate-in fade-in duration-300">
      {/* Welcome & Quick Action Card */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#071330] via-[#091738] to-[#141238] border border-sky-500/30 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_20px_rgba(12,151,224,0.4)] shrink-0 overflow-hidden">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}&backgroundColor=070d1d`}
              alt={user.name}
              className="w-full h-full rounded-xl bg-slate-900 object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1 text-xs font-mono text-cyan-400">
              <span className="font-bold">LEVEL {user.level} · ATHLETE</span>
              <span>·</span>
              <span>{user.xp} XP</span>
            </div>
            {/* Full Name */}
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight break-words">
              {user.name}
            </h2>
            {/* Username placed clearly below Full Name */}
            <span className="text-xs sm:text-sm font-mono text-cyan-400 font-semibold block mt-0.5 truncate">
              @{user.username}
            </span>
            <p className="text-slate-400 text-xs mt-1">
              Your kinetic velocity is in top form today. Ready for your next sprint?
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartTest}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(12,151,224,0.4)] transition hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Zap className="w-4 h-4" />
          <span>Launch Sprint</span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Best WPM */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Best WPM</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-amber-400">{bestWpm}</span>
          </div>
          <span className="text-[11px] text-slate-500">All-time record</span>
        </div>

        {/* Average WPM */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Avg Speed</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-cyan-400">{avgWpm}</span>
          </div>
          <span className="text-[11px] text-slate-500">Trailing average</span>
        </div>

        {/* Accuracy */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Accuracy</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-emerald-400">{avgAccuracy}%</span>
          </div>
          <span className="text-[11px] text-slate-500">Precision rate</span>
        </div>

        {/* Streak */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-orange-400">{user.streak}</span>
            <span className="text-xs text-slate-400 ml-1">days</span>
          </div>
          <span className="text-[11px] text-slate-500">Best: {user.longestStreak} days</span>
        </div>

        {/* Tests Completed */}
        <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Tests</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-purple-400">{totalTests}</span>
          </div>
          <span className="text-[11px] text-slate-500">Total verified sessions</span>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#071330] to-cyan-950/40 border border-purple-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
              <span>AI Coaching Recommendation</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Active
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Your punctuation accuracy is 6% below your alpha-character average. Launch targeted Precision Training.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToAiCoach}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 hover:text-white transition text-xs font-semibold whitespace-nowrap"
        >
          <span>Open Coach</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Achievements Showcase Strip */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Unlocked Badges ({unlockedCount} / {achievements.length})</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Total XP Gained: {user.xp}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-xl border flex flex-col items-center text-center transition ${
                ach.isUnlocked
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 mb-2">
                <Trophy className={`w-5 h-5 ${ach.isUnlocked ? 'text-amber-400' : 'text-slate-600'}`} />
              </div>
              <span className="text-xs font-bold leading-tight line-clamp-1">{ach.title}</span>
              <span className="text-[10px] text-slate-400 mt-1">+{ach.xpReward} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tests Table & History Search */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-sky-500/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Verified Test History</h3>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[150px] sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="classic">Classic</option>
              <option value="code">Code</option>
              <option value="precision">Precision</option>
              <option value="quote">Quote</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredResults.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No test sessions recorded yet. Launch your first sprint above to track history!
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-mono tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">WPM</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Consistency</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredResults.slice(0, 10).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition text-slate-300">
                    <td className="py-3 px-3 text-slate-400">{r.date}</td>
                    <td className="py-3 px-3 capitalize text-sky-400 font-semibold">{r.mode}</td>
                    <td className="py-3 px-3">{r.timeTaken}s</td>
                    <td className="py-3 px-3 text-white font-bold text-sm">{r.wpm}</td>
                    <td className="py-3 px-3 text-emerald-400">{r.accuracy}%</td>
                    <td className="py-3 px-3 text-purple-400">{r.consistency}%</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedResult(r)}
                        className="text-xs text-sky-400 hover:text-white underline font-sans"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Result Inspector Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-[#070e24] border border-sky-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
              <h4 className="font-bold text-white text-base">Session Telemetry Breakdown</h4>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-white font-bold px-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block uppercase">Velocity</span>
                <span className="text-xl font-bold text-cyan-400">{selectedResult.wpm} WPM</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block uppercase">Accuracy</span>
                <span className="text-xl font-bold text-emerald-400">{selectedResult.accuracy}%</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block uppercase">Raw Speed</span>
                <span className="text-lg font-bold text-slate-300">{selectedResult.rawWpm} WPM</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block uppercase">Consistency</span>
                <span className="text-lg font-bold text-purple-400">{selectedResult.consistency}%</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div>Mode: <strong className="text-slate-200 uppercase">{selectedResult.mode}</strong></div>
              <div>Date: <strong className="text-slate-200">{selectedResult.date}</strong></div>
              <div>Duration: <strong className="text-slate-200">{selectedResult.timeTaken} seconds</strong></div>
              <div>Correct Keystrokes: <strong className="text-emerald-400">{selectedResult.correctChars}</strong></div>
              <div>Errors Encountered: <strong className="text-red-400">{selectedResult.errors}</strong></div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedResult(null)}
              className="mt-2 w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
