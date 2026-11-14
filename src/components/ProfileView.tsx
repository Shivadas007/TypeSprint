import React, { useState } from 'react';
import { UserProfile, TestResult, Achievement, ThemeId } from '../types';
import { User, Flame, Trophy, Award, Check, Settings, Shield, Volume2, Palette, Clock, Sparkles, RefreshCw, Download } from 'lucide-react';
import { sound } from '../utils/sound';
import { PRESET_CARTOON_AVATARS, generateRandomCartoonAvatar, DEFAULT_CARTOON_AVATAR_FALLBACK } from '../utils/avatars';
import { sanitizeUsername, syncProfileAndLeaderboard } from '../utils/firebaseStore';

interface ProfileViewProps {
  user: UserProfile;
  results: TestResult[];
  achievements: Achievement[];
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  results,
  achievements,
  currentTheme,
  onThemeChange,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || generateRandomCartoonAvatar(user.username));
  const [soundActive, setSoundActive] = useState(user.soundEnabled);
  const [savedMessage, setSavedMessage] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const bestWpm = results.length > 0 ? Math.max(...results.map((r) => r.wpm)) : user.bestWpm;
  const avgWpm =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / results.length)
      : user.avgWpm;
  const totalSeconds = results.reduce((acc, r) => acc + r.timeTaken, 0);
  const practiceMinutes = Math.round(totalSeconds / 60);

  const handleRandomizeAvatar = () => {
    const randomSeed = user.username + '_' + Math.random().toString(36).substring(2, 7);
    const newAvatar = generateRandomCartoonAvatar(randomSeed);
    setAvatarUrl(newAvatar);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    sound.enabled = soundActive;

    const cleanHandle = sanitizeUsername(username || user.username, user.id.slice(0, 6));
    setUsername(cleanHandle);

    const updated: UserProfile = {
      ...user,
      name: name.trim().slice(0, 80) || user.name,
      username: cleanHandle,
      avatarUrl,
      soundEnabled: soundActive,
      themePreference: currentTheme,
    };

    onUpdateProfile(updated);

    try {
      await syncProfileAndLeaderboard(user.id, updated);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } catch {
      setSaveError('Failed to sync changes to cloud. Please try again.');
    }
  };

  const themes: { id: ThemeId; label: string; accent: string }[] = [
    { id: 'cosmic', label: 'Cosmic Core', accent: 'from-cyan-400 to-blue-600' },
    { id: 'midnight', label: 'Midnight Void', accent: 'from-purple-500 to-pink-600' },
    { id: 'cyber', label: 'Cyber Neon', accent: 'from-emerald-400 to-teal-600' },
    { id: 'aurora', label: 'Aurora Borealis', accent: 'from-teal-300 to-indigo-500' },
    { id: 'light', label: 'Minimal Light', accent: 'from-sky-400 to-blue-500' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-10 sm:pb-12 animate-in fade-in duration-300">
      {/* Profile Header Hero */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#071330] via-[#091738] to-[#120f2e] border border-sky-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 w-full md:w-auto min-w-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-cyan-400/60 p-1 shadow-[0_0_25px_rgba(12,151,224,0.35)] relative overflow-hidden bg-slate-900 group shrink-0">
            <img
              src={avatarUrl || DEFAULT_CARTOON_AVATAR_FALLBACK}
              alt={user.name}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_CARTOON_AVATAR_FALLBACK;
              }}
              className="w-full h-full rounded-xl object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs uppercase font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                LEVEL {user.level} · SPEED ATHLETE
              </span>
            </div>
            {/* User Full Name */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight break-words">{user.name}</h2>
            {/* Username placed clearly below Full Name */}
            <span className="text-sm font-mono text-cyan-400 font-semibold mt-0.5 truncate">@{user.username}</span>
            <span className="text-xs text-slate-400 font-mono mt-0.5 break-all">{user.email}</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full md:w-64 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">Level {user.level} Mastery</span>
            <span className="text-cyan-400 font-bold">{user.xp % 1000} / 1,000 XP</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full"
              style={{ width: `${Math.min(100, ((user.xp % 1000) / 1000) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Peak Velocity</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-amber-400">{bestWpm} WPM</span>
          </div>
          <span className="text-[11px] text-slate-500">Verified Best</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Active Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-orange-400">{user.streak} Days</span>
          </div>
          <span className="text-[11px] text-slate-500">Longest: {user.longestStreak}</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total Practice</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-purple-400">{practiceMinutes} Min</span>
          </div>
          <span className="text-[11px] text-slate-500">{results.length} total tests</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Achievements</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-cyan-400">
              {achievements.filter((a) => a.isUnlocked).length} / {achievements.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Badges Unlocked</span>
        </div>
      </div>

      {/* Settings & Preferences Form */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-5 sm:gap-6">
        <div className="flex items-center gap-2 pb-4 border-b border-sky-500/15">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Settings & Kinetic Preferences</h3>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Animated Cartoon Avatar Customization Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-sky-500/20 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs uppercase font-mono text-cyan-400 font-bold block">
                  Animated Cartoon Art Profile Picture
                </span>
                <span className="text-xs text-slate-400">
                  Select your cartoon persona or generate a fresh random animation art
                </span>
              </div>
              <button
                type="button"
                onClick={handleRandomizeAvatar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Randomize Cartoon Art</span>
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
              {PRESET_CARTOON_AVATARS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAvatarUrl(item.url)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    avatarUrl === item.url
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                  title={item.name}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-900 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_CARTOON_AVATAR_FALLBACK;
                    }}
                  />
                  <span className="text-[9px] text-slate-300 truncate max-w-full font-mono">{item.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="text-xs uppercase font-mono text-slate-400 block mb-1.5">Full Name</label>
              <input
                type="text"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-mono text-slate-400 block mb-1.5">Leaderboard Handle</label>
              <div className="relative">
                <span className="text-sm font-mono text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2">@</span>
                <input
                  type="text"
                  maxLength={32}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-mono text-slate-400 block mb-1.5">
                Mechanical Audio Feedback
              </label>
              <button
                type="button"
                onClick={() => setSoundActive(!soundActive)}
                className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between transition ${
                  soundActive
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  {soundActive ? 'Keystroke Sound Active' : 'Muted'}
                </span>
                <span className="text-xs font-mono">{soundActive ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-xs uppercase font-mono text-slate-400 block mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Cosmic Color Palette</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onThemeChange(t.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                    currentTheme === t.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${t.accent} shadow-md`} />
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save & Backup Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-sky-500/10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const payload = {
                    exportedAt: new Date().toISOString(),
                    app: 'Type Sprint',
                    profile: user,
                    resultsHistory: results,
                    achievements,
                  };
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `typesprint-backup-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Data Backup</span>
              </button>
              {savedMessage && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" /> Synced to cloud profile
                </span>
              )}
              {saveError && (
                <span className="text-xs text-red-400 font-semibold">{saveError}</span>
              )}
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition hover:scale-[1.02] active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
