import React, { useState } from 'react';
import { UserProfile, ThemeId, TestResult } from '../types';
import { calculateRealtimeStreak } from '../utils/streak';
import { StreakModal } from './StreakModal';
import { Flame, LogIn, UserPlus, Menu, X, LogOut, Sparkles, Crown, Sun, Moon, Shield } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  user: UserProfile | null;
  resultsHistory?: TestResult[];
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  currentTheme: ThemeId;
  onThemeToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  resultsHistory = [],
  onOpenAuth,
  onLogout,
  currentTheme,
  onThemeToggle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  // Clean primary navigation links
  const mainNavItems = [
    { id: 'practice', label: 'Practice' },
    { id: 'coach', label: 'AI Coach' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-all ${
        currentTheme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
          : 'bg-[#020307]/90 border-sky-500/15 text-slate-100'
      }`}>
        <div className="w-full max-w-[1880px] mx-auto px-4 sm:px-8 xl:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo Lockup */}
          <button
            type="button"
            onClick={() => {
              onTabChange('practice');
              setMobileMenuOpen(false);
            }}
            className="flex items-center text-left group transition shrink-0 py-1 cursor-pointer"
            title="Type Sprint - Typing Speed Test"
          >
            <img
              src="/assets/aistudio/logo_original.png"
              alt="Type Sprint Logo"
              className="h-11 sm:h-13 md:h-15 w-auto object-contain group-hover:scale-105 transition-all duration-200"
            />
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm sm:text-base font-bold">
            {mainNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`transition-colors whitespace-nowrap relative py-1 ${
                    isActive
                      ? (currentTheme === 'light' ? 'text-cyan-700 font-extrabold' : 'text-cyan-400 font-extrabold')
                      : (currentTheme === 'light' ? 'text-slate-700 hover:text-cyan-700' : 'text-slate-300 hover:text-cyan-300')
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full shadow-[0_0_10px_#38bdf8]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Interactive Fire Button (Daily Streak Counter - Always Active) */}
            <button
              type="button"
              onClick={() => setStreakModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 text-orange-400 text-sm font-mono font-bold shadow-[0_0_15px_rgba(249,115,22,0.35)] hover:shadow-[0_0_24px_rgba(249,115,22,0.7)] hover:border-orange-400 hover:scale-105 active:scale-95 transition-all group"
              title="Daily Kinetic Streak Tracker"
              aria-label="Daily Streak Progress"
            >
              <Flame className="w-4.5 h-4.5 text-orange-400 group-hover:animate-bounce transition-transform" />
              <span>{user ? user.streak : calculateRealtimeStreak(resultsHistory).currentStreak}</span>
            </button>

            {/* Interactive Plans Button */}
            <button
              type="button"
              onClick={() => onTabChange('pricing')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-mono font-bold uppercase transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-r from-cyan-500/15 to-blue-600/15 text-cyan-300 border border-cyan-400/50 shadow-[0_0_14px_rgba(12,151,224,0.3)] hover:shadow-[0_0_24px_rgba(12,151,224,0.6)] cursor-pointer"
              title="View Membership & Pricing Plans"
              aria-label="View Plans"
            >
              <Crown className="w-4 h-4 text-cyan-400" />
              <span>Plans</span>
            </button>

            {/* Quick Theme Toggle Button (Light / Dark) */}
            <button
              type="button"
              onClick={onThemeToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
                currentTheme === 'light'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] hover:bg-amber-200'
                  : 'bg-slate-900/90 text-cyan-300 border border-sky-500/30 shadow-[0_0_12px_rgba(12,151,224,0.25)] hover:border-cyan-400 hover:text-white'
              }`}
              title={currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {currentTheme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-600 animate-spin-slow" />
                  <span className="hidden sm:inline text-xs font-bold text-amber-900">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-300" />
                  <span className="hidden sm:inline text-xs font-bold text-slate-300">Theme</span>
                </>
              )}
            </button>

            {/* GLOWING Sign In & Register Buttons (Shown when logged out) OR User Profile Badge (Shown when signed in) */}
            {!user ? (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onTabChange('login')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    currentTab === 'login'
                      ? 'text-white bg-cyan-500/30 border border-cyan-300 shadow-[0_0_22px_rgba(12,151,224,0.7)]'
                      : 'text-cyan-300 bg-cyan-950/40 border border-cyan-400/50 shadow-[0_0_14px_rgba(12,151,224,0.3)] hover:shadow-[0_0_24px_rgba(12,151,224,0.65)] hover:border-cyan-300 hover:text-white'
                  }`}
                  title="Sign in to your athlete profile"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('register')}
                  className="px-4 sm:px-5 py-2 rounded-xl text-sm font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_20px_rgba(12,151,224,0.55),0_0_35px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(12,151,224,0.85),0_0_50px_rgba(56,189,248,0.5)] transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                  title="Create a new typing athlete account"
                >
                  Register
                </button>
              </div>
            ) : (
              /* Signed In Profile Card with Avatar, Full Name, and @username below */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl bg-[#060e24]/90 hover:bg-[#0b1739] border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_16px_rgba(12,151,224,0.25)] hover:shadow-[0_0_24px_rgba(12,151,224,0.55)] transition-all duration-200 group text-left cursor-pointer"
                  title="Account Profile & Settings"
                  aria-label="User Account Menu"
                >
                  {/* Cartoon Profile Avatar */}
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-[1.5px] bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_14px_rgba(12,151,224,0.5)] shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}&backgroundColor=070d1d`}
                      alt={user.name}
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}&backgroundColor=070d1d`;
                      }}
                      className="w-full h-full rounded-[10px] bg-[#040817] object-cover"
                    />
                  </div>

                  {/* Full Name with @username below */}
                  <div className="hidden sm:flex flex-col min-w-0 pr-0.5 text-left">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight truncate max-w-[120px] md:max-w-[160px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-cyan-400 font-mono font-medium leading-tight truncate">
                      @{user.username}
                    </span>
                  </div>

                  <span className={`text-slate-400 group-hover:text-cyan-300 text-xs transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-[#070e24] border border-sky-500/30 rounded-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in">
                    {/* Header with Full Name and @username */}
                    <div className="px-3 py-2.5 border-b border-sky-500/20 bg-slate-900/50 rounded-xl mb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                          {user.plan.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">Lvl {user.level}</span>
                      </div>
                      <span className="text-sm font-bold text-white block truncate leading-tight">{user.name}</span>
                      <span className="text-xs text-cyan-400 font-mono block">@{user.username}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onTabChange('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-between"
                    >
                      <span>Dashboard & Stats</span>
                      <span className="text-[10px] text-slate-500 font-mono">{user.bestWpm} WPM</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onTabChange('coach');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI Typing Coach</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onTabChange('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      Profile & Cartoon Avatars
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onTabChange('pricing');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition flex items-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Manage Subscription</span>
                    </button>

                    {/* Admin Console - Strictly visible to shivadas.sw@gmail.com */}
                    {user?.email?.toLowerCase().trim() === 'shivadas.sw@gmail.com' && (
                      <button
                        type="button"
                        onClick={() => {
                          onTabChange('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition flex items-center gap-1.5 border border-amber-500/30 rounded-lg"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <div className="border-t border-sky-500/15 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-3 pb-5 bg-white dark:bg-[#040817] border-b border-slate-200 dark:border-sky-500/20 flex flex-col gap-2 shadow-xl">
            {/* If user logged in, show user info card in mobile drawer */}
            {user && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-sky-500/30 flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}&backgroundColor=070d1d`}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl bg-slate-800 object-cover border border-cyan-400/40"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.name}</span>
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono">@{user.username}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition"
                >
                  Sign Out
                </button>
              </div>
            )}

            {mainNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3.5 py-2.5 rounded-lg text-sm font-bold transition ${
                  currentTab === item.id
                    ? 'bg-sky-500/15 text-cyan-600 dark:text-cyan-300 font-extrabold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Admin Console strictly for shivadas.sw@gmail.com in mobile drawer */}
            {user?.email?.toLowerCase().trim() === 'shivadas.sw@gmail.com' && (
              <button
                type="button"
                onClick={() => {
                  onTabChange('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3.5 py-2.5 rounded-lg text-sm font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 transition flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Operations Console</span>
              </button>
            )}

            {!user && (
              <div className="border-t border-slate-200 dark:border-sky-500/15 pt-2 mt-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('login');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3.5 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-cyan-300 hover:text-cyan-600 dark:hover:text-white"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('register');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3.5 py-2 rounded-lg text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-white"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Interactive Streak Modal */}
      <StreakModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        user={user}
        results={resultsHistory}
        onStartPractice={() => onTabChange('practice')}
      />
    </>
  );
};
