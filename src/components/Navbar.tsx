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
          : 'bg-[#020307]/95 border-sky-500/15 text-slate-100'
      }`}>
        <div className="w-full max-w-[1880px] mx-auto px-2.5 sm:px-6 lg:px-10 xl:px-12 h-14 sm:h-16 lg:h-[72px] flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          {/* Brand Logo Lockup */}
          <button
            type="button"
            onClick={() => {
              onTabChange('practice');
              setMobileMenuOpen(false);
              setUserDropdownOpen(false);
            }}
            className="flex items-center text-left group transition shrink-0 py-1 cursor-pointer"
            title="Type Sprint - Typing Speed Test"
          >
            <img
              src="/assets/aistudio/logo_original.png"
              alt="Type Sprint Logo"
              className="h-8 sm:h-11 lg:h-12 w-auto object-contain group-hover:scale-105 transition-all duration-200"
            />
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm xl:text-base font-bold">
            {mainNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-active={isActive ? 'true' : undefined}
                  onClick={() => onTabChange(item.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 relative py-1 ${
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

          {/* Zone 3: Right Side Panel (Compact on phones 320px+, full on tablet/desktop) */}
          <div className="flex items-center gap-1 sm:gap-2.5 lg:gap-3 shrink-0 min-w-0">
            {/* Interactive Fire Button (Daily Streak Counter) */}
            <button
              type="button"
              data-light-preserve="true"
              onClick={() => {
                setMobileMenuOpen(false);
                setUserDropdownOpen(false);
                setStreakModalOpen(true);
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all group whitespace-nowrap shrink-0 hover:scale-105 active:scale-95 ${
                currentTheme === 'light'
                  ? 'bg-orange-100 border border-orange-300 text-orange-700 shadow-sm hover:bg-orange-200'
                  : 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_24px_rgba(249,115,22,0.7)] hover:border-orange-400'
              }`}
              title="Daily Kinetic Streak Tracker"
              aria-label="Daily Streak Progress"
            >
              <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:animate-bounce transition-transform shrink-0 ${currentTheme === 'light' ? 'text-orange-600' : 'text-orange-400'}`} />
              <span className="tabular-nums">{user ? user.streak : calculateRealtimeStreak(resultsHistory).currentStreak}</span>
            </button>

            {/* Interactive Plans Button (Hidden on tiny phones <640px since Pricing is in mobile nav bar & drawer) */}
            <button
              type="button"
              data-active={currentTab === 'pricing' ? 'true' : undefined}
              data-light-preserve="true"
              onClick={() => onTabChange('pricing')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs lg:text-sm font-mono font-bold uppercase transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                currentTheme === 'light'
                  ? 'bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100'
                  : 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 text-cyan-300 border border-cyan-400/50 shadow-[0_0_14px_rgba(12,151,224,0.3)] hover:shadow-[0_0_24px_rgba(12,151,224,0.6)]'
              }`}
              title="View Membership & Pricing Plans"
              aria-label="View Plans"
            >
              <Crown className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${currentTheme === 'light' ? 'text-sky-600' : 'text-cyan-400'}`} />
              <span>Plans</span>
            </button>

            {/* Quick Theme Toggle Button (Light / Dark) */}
            <button
              type="button"
              onClick={onThemeToggle}
              className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 ${
                currentTheme === 'light'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] hover:bg-amber-200'
                  : 'bg-slate-900/90 text-cyan-300 border border-sky-500/30 shadow-[0_0_12px_rgba(12,151,224,0.25)] hover:border-cyan-400 hover:text-white'
              }`}
              title={currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {currentTheme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-600 animate-spin-slow shrink-0" />
                  <span className="hidden md:inline text-xs font-bold text-amber-900">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span className="hidden md:inline text-xs font-bold text-slate-300">Theme</span>
                </>
              )}
            </button>

            {/* Sign In & Register Buttons OR User Profile Badge */}
            {!user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  data-light-preserve="true"
                  onClick={() => {
                    onTabChange('login');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
                    currentTab === 'login'
                      ? currentTheme === 'light'
                        ? 'text-sky-800 bg-sky-100 border border-sky-400 shadow-sm'
                        : 'text-white bg-cyan-500/30 border border-cyan-300 shadow-[0_0_22px_rgba(12,151,224,0.7)]'
                      : currentTheme === 'light'
                      ? 'text-sky-700 bg-sky-50 border border-sky-300 hover:bg-sky-100'
                      : 'text-cyan-300 bg-cyan-950/40 border border-cyan-400/50 shadow-[0_0_14px_rgba(12,151,224,0.3)] hover:shadow-[0_0_24px_rgba(12,151,224,0.65)] hover:border-cyan-300 hover:text-white'
                  }`}
                  title="Sign in to your athlete profile"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('register')}
                  className="hidden sm:inline-flex px-3.5 md:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_20px_rgba(12,151,224,0.55),0_0_35px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(12,151,224,0.85),0_0_50px_rgba(56,189,248,0.5)] transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
                  title="Create a new typing athlete account"
                >
                  Register
                </button>
              </div>
            ) : (
              /* Signed In Profile Card */
              <div className="relative">
                <button
                  type="button"
                  data-light-preserve="true"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  className={`flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-2xl border transition-all duration-200 group text-left cursor-pointer ${
                    currentTheme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 shadow-sm'
                      : 'bg-[#060e24]/90 hover:bg-[#0b1739] border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_16px_rgba(12,151,224,0.25)] hover:shadow-[0_0_24px_rgba(12,151,224,0.55)]'
                  }`}
                  title="Account Profile & Settings"
                  aria-label="User Account Menu"
                  aria-expanded={userDropdownOpen}
                >
                  {/* Cartoon Profile Avatar */}
                  <div className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-xl p-[1.5px] bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_14px_rgba(12,151,224,0.5)] shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
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
                  <div className="hidden md:flex flex-col min-w-0 pr-0.5 text-left">
                    <span className="text-xs lg:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight truncate max-w-[110px] xl:max-w-[160px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] lg:text-[11px] text-cyan-400 font-mono font-medium leading-tight truncate">
                      @{user.username}
                    </span>
                  </div>

                  <span className={`text-slate-400 group-hover:text-cyan-300 text-xs transition-transform duration-200 pr-0.5 sm:pr-1 ${userDropdownOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {/* User Dropdown Menu (anchored to relative button container; outside-header backdrop handles viewport clicks) */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-1.5rem)] max-h-[80dvh] overflow-y-auto bg-[#070e24] border border-sky-500/30 rounded-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in">
                    {/* Header with Full Name and @username */}
                    <div className="px-3 py-2.5 border-b border-sky-500/20 bg-slate-900/50 rounded-xl mb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                          {user.plan.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">Lvl {user.level}</span>
                      </div>
                      <span className="text-sm font-bold text-white block truncate leading-tight">{user.name}</span>
                      <span className="text-xs text-cyan-400 font-mono block truncate">@{user.username}</span>
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
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums">{user.bestWpm} WPM</span>
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

            {/* Mobile/Tablet hamburger menu toggle */}
            <button
              type="button"
              onClick={() => {
                setUserDropdownOpen(false);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition shrink-0"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Dedicated Mobile Quick-Navigation Bar (Fixed h-10 so header height is deterministic: 56px + 40px + 1px border = 97px) */}
        <nav
          aria-label="Mobile quick navigation"
          className={`sm:hidden w-full h-10 border-t px-2 flex items-center gap-1 overflow-x-auto no-scrollbar ${
            currentTheme === 'light'
              ? 'bg-slate-50/95 border-slate-200'
              : 'bg-[#040917]/95 border-sky-500/15'
          }`}
        >
          {mainNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-active={isActive ? 'true' : undefined}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 min-w-fit px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap text-center transition ${
                  isActive
                    ? currentTheme === 'light'
                      ? 'bg-sky-500/15 text-sky-700 border border-sky-400/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : currentTheme === 'light'
                    ? 'text-slate-600 hover:text-sky-700'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Outside-header Viewport Backdrop for User Dropdown (avoids backdrop-blur containing-block trap) */}
      {userDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserDropdownOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile/Tablet Slide-down Overlay Menu & Viewport Backdrop (placed outside <header> so fixed spans full 100dvh) */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-[97px] sm:top-[65px] bg-black/60 backdrop-blur-[2px] z-30"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`lg:hidden fixed inset-x-0 top-[97px] sm:top-[65px] z-40 px-4 pt-3 pb-5 border-b flex flex-col gap-1.5 shadow-2xl max-h-[calc(100dvh-6.25rem)] overflow-y-auto ${
              currentTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-[#040817]/95 border-sky-500/20 text-slate-100'
            }`}
          >
            {/* If user logged in, show user info card in mobile drawer */}
            {user && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 mb-1 ${
                  currentTheme === 'light'
                    ? 'bg-slate-100 border-slate-200'
                    : 'bg-slate-900 border-sky-500/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}&backgroundColor=070d1d`}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl bg-slate-800 object-cover border border-cyan-400/40 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-bold leading-tight truncate ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {user.name}
                    </span>
                    <span className={`text-xs font-mono truncate ${currentTheme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>
                      @{user.username}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition shrink-0"
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
                className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                  currentTab === item.id
                    ? currentTheme === 'light'
                      ? 'bg-sky-100 text-cyan-700 font-extrabold'
                      : 'bg-sky-500/15 text-cyan-300 font-extrabold'
                    : currentTheme === 'light'
                    ? 'text-slate-700 hover:text-cyan-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user && (
              <button
                type="button"
                onClick={() => {
                  onTabChange('profile');
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                  currentTab === 'profile'
                    ? currentTheme === 'light'
                      ? 'bg-sky-100 text-cyan-700 font-extrabold'
                      : 'bg-sky-500/15 text-cyan-300 font-extrabold'
                    : currentTheme === 'light'
                    ? 'text-slate-700 hover:text-cyan-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
                }`}
              >
                Profile & Avatars
              </button>
            )}

            {/* Admin Console strictly for shivadas.sw@gmail.com in mobile drawer */}
            {user?.email?.toLowerCase().trim() === 'shivadas.sw@gmail.com' && (
              <button
                type="button"
                onClick={() => {
                  onTabChange('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 transition flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Operations Console</span>
              </button>
            )}

            {!user && (
              <div
                className={`border-t pt-2.5 mt-1 grid grid-cols-2 gap-2 ${
                  currentTheme === 'light' ? 'border-slate-200' : 'border-sky-500/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('login');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center border transition ${
                    currentTheme === 'light'
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-cyan-500/30 text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-black text-center text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500"
                >
                  Register
                </button>
              </div>
            )}
            </div>
          </>
        )}

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
