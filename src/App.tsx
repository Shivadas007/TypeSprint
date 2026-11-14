import React, { useState, useEffect, useCallback } from 'react';
import { TestMode, DifficultyLevel, TestResult, UserProfile, ThemeId, Achievement } from './types';
import { initialAchievements, checkAchievements } from './data/achievements';
import { CosmicBackground } from './components/CosmicBackground';
import { CursorAura } from './components/CursorAura';
import { Navbar } from './components/Navbar';
import { TypingEngine } from './components/TypingEngine';
import { ResultsHUD } from './components/ResultsHUD';
import { KeyboardVisualizer } from './components/KeyboardVisualizer';
import { AiCoachView } from './components/AiCoachView';
import { DashboardView } from './components/DashboardView';
import { LeaderboardView } from './components/LeaderboardView';
import { PricingView } from './components/PricingView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { LoginPageView } from './components/LoginPageView';
import { RegisterPageView } from './components/RegisterPageView';
import { AuthModal } from './components/AuthModal';
import { LegalView } from './components/LegalView';
import { NotFoundView } from './components/NotFoundView';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { sound } from './utils/sound';
import { calculateRealtimeStreak } from './utils/streak';
import { trackPageView } from './utils/analytics';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import {
  ensureUserProfile,
  fetchUserResults,
  persistTestCompletion,
  signOutAccount,
  syncProfileAndLeaderboard,
} from './utils/firebaseStore';
import {
  Zap,
  Sparkles,
  Brain,
  Trophy,
  Code,
} from 'lucide-react';

const STORAGE_KEY_RESULTS = 'typesprint_test_history_v2';
const STORAGE_KEY_USER = 'typesprint_user_session_v2';
const STORAGE_KEY_ACHIEVEMENTS = 'typesprint_achievements_v2';
const STORAGE_KEY_THEME = 'typesprint_active_theme_v2';

const PATH_TO_TAB: Record<string, string> = {
  '/': 'practice',
  '/index.html': 'practice',
  '/practice': 'practice',
  '/coach': 'coach',
  '/leaderboard': 'leaderboard',
  '/pricing': 'pricing',
  '/dashboard': 'dashboard',
  '/profile': 'profile',
  '/login': 'login',
  '/register': 'register',
  '/admin': 'admin',
  '/privacy': 'privacy',
  '/terms': 'terms',
};

const TAB_TO_PATH: Record<string, string> = {
  practice: '/',
  coach: '/coach',
  leaderboard: '/leaderboard',
  pricing: '/pricing',
  dashboard: '/dashboard',
  profile: '/profile',
  login: '/login',
  register: '/register',
  admin: '/admin',
  privacy: '/privacy',
  terms: '/terms',
};

function resolveInitialTab(): { tab: string; unknownPath?: string } {
  if (typeof window === 'undefined') return { tab: 'practice' };
  const params = new URLSearchParams(window.location.search);
  const queryTab = params.get('tab');
  if (queryTab && TAB_TO_PATH[queryTab]) {
    return { tab: queryTab };
  }
  const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (PATH_TO_TAB[cleanPath]) {
    return { tab: PATH_TO_TAB[cleanPath] };
  }
  return { tab: '404', unknownPath: window.location.pathname };
}

export default function App() {
  // Navigation State with clean path & 404 detection
  const initialRoute = resolveInitialTab();
  const [currentTab, setCurrentTab] = useState<string>(initialRoute.tab);
  const [unknownPath, setUnknownPath] = useState<string | undefined>(initialRoute.unknownPath);

  const navigateToTab = useCallback((tab: string) => {
    setCurrentTab(tab);
    setUnknownPath(undefined);
    if (tab === 'practice') {
      setCurrentResult(null);
    }
    const targetPath = TAB_TO_PATH[tab] || '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
    trackPageView(targetPath);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const resolved = resolveInitialTab();
      setCurrentTab(resolved.tab);
      setUnknownPath(resolved.unknownPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Theme & Sound State
  const [theme, setTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeId) || 'cosmic';
  });

  // Typing Test Configuration
  const [mode, setMode] = useState<TestMode>('classic');
  const [level, setLevel] = useState<DifficultyLevel>('easy');
  const [duration, setDuration] = useState<number>(30); // 15, 30, 60, 120
  const [customText, setCustomText] = useState<string | undefined>(undefined);
  const [customTextTitle, setCustomTextTitle] = useState<string | undefined>(undefined);

  // Active Key Keystroke & Visualizer Telemetry
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [typingEnergy, setTypingEnergy] = useState<number>(0);

  // Results State
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [resultsHistory, setResultsHistory] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESULTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : initialAchievements;
    } catch {
      return initialAchievements;
    }
  });

  // User Profile State (defaults strictly to null if not logged in)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Cleanse legacy dummy plan or mock subscription if present
        if (parsed.plan === 'pro' || parsed.plan === 'master' || parsed.subscriptionStatus !== 'none') {
          parsed.plan = 'free';
          parsed.subscriptionStatus = 'none';
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Sync theme changes with DOM
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Save history updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(resultsHistory));
    } catch {
      // ignore
    }
  }, [resultsHistory]);

  // Save achievements updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(achievements));
    } catch {
      // ignore
    }
  }, [achievements]);

  // Synchronize auth state strictly via Firebase Authentication (no auto-login after sign-out)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY_USER);
        return;
      }

      try {
        const profile = await ensureUserProfile(fbUser);
        setUser(profile);

        const cloudResults = await fetchUserResults(fbUser.uid);
        if (cloudResults.length > 0) {
          setResultsHistory((localPrev) => {
            const seen = new Set(cloudResults.map((r) => r.id));
            const merged = [...cloudResults, ...localPrev.filter((r) => !seen.has(r.id))];
            merged.sort((a, b) => b.timestamp - a.timestamp);
            return merged;
          });
        }
      } catch (err) {
        console.error('Failed to sync Firebase athlete profile:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Synchronize user metrics strictly with real cached test history (no dummy stats)
  useEffect(() => {
    if (!user) return;
    const realTests = resultsHistory.length;
    const realBest = realTests > 0 ? Math.max(...resultsHistory.map((r) => r.wpm)) : 0;
    const realAvg =
      realTests > 0
        ? Math.round(resultsHistory.reduce((acc, r) => acc + r.wpm, 0) / realTests)
        : 0;
    const realXp = resultsHistory.reduce(
      (acc, r) => acc + Math.round(r.wpm * 2 + (r.accuracy / 100) * 50),
      0
    );
    const realLevel = Math.max(1, Math.floor(realXp / 1000) + 1);
    const realStreakData = calculateRealtimeStreak(resultsHistory);
    const realStreak = realStreakData.currentStreak;
    const realLongest = realStreakData.longestStreak;

    if (
      user.testsCompleted !== realTests ||
      user.bestWpm !== realBest ||
      user.avgWpm !== realAvg ||
      user.streak !== realStreak ||
      user.longestStreak !== realLongest ||
      user.plan !== 'free' ||
      user.subscriptionStatus !== 'none'
    ) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              plan: 'free',
              subscriptionStatus: 'none',
              testsCompleted: realTests,
              bestWpm: realBest,
              avgWpm: realAvg,
              streak: realStreak,
              longestStreak: realLongest,
              xp: realXp,
              level: realLevel,
            }
          : null
      );
    }
  }, [resultsHistory]);

  // Save user updates
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  // Keystroke handler for typing animations
  const handleKeyStroke = useCallback((key: string) => {
    setActiveKey(key);
    setTypingEnergy(0.1);
    setTimeout(() => {
      setActiveKey((prev) => (prev === key ? null : prev));
    }, 90);
  }, []);

  // Handle completed test
  const handleTestComplete = useCallback(
    (result: TestResult) => {
      // Check personal best
      const currentBest = resultsHistory.length > 0 ? Math.max(...resultsHistory.map((r) => r.wpm)) : 0;
      const isPb = result.wpm > currentBest && result.wpm > 0;
      result.isPersonalBest = isPb;

      setCurrentResult(result);
      const updatedHistory = [result, ...resultsHistory];
      setResultsHistory(updatedHistory);

      // Check achievements
      if (user) {
        const { updatedList, newlyUnlocked } = checkAchievements(achievements, result, user, updatedHistory);
        if (newlyUnlocked.length > 0) {
          setAchievements(updatedList);
          sound.unlockAchievement();
        }

        // Update user XP, tests, streak with real values
        const realTests = updatedHistory.length;
        const realBest = Math.max(...updatedHistory.map((r) => r.wpm));
        const realAvg = Math.round(updatedHistory.reduce((acc, r) => acc + r.wpm, 0) / realTests);
        const gainedXp = Math.round(result.wpm * 2 + (result.accuracy / 100) * 50);
        const newTotalXp = user.xp + gainedXp;
        const newLevel = Math.max(1, Math.floor(newTotalXp / 1000) + 1);

        const realStreakData = calculateRealtimeStreak(updatedHistory);

        const updatedUser: UserProfile = {
          ...user,
          plan: 'free',
          subscriptionStatus: 'none',
          xp: newTotalXp,
          level: newLevel,
          bestWpm: realBest,
          avgWpm: realAvg,
          testsCompleted: realTests,
          streak: realStreakData.currentStreak,
          longestStreak: realStreakData.longestStreak,
        };

        setUser(updatedUser);

        // Persist completed sprint & updated profile to Firestore
        persistTestCompletion(user.id, result, updatedUser).catch(() => {
          // offline fallback handled via localStorage
        });
      }
    },
    [resultsHistory, user, achievements]
  );

  // Retry or start new test
  const handleRetryTest = () => {
    setCurrentResult(null);
    setCustomText(undefined);
    setCustomTextTitle(undefined);
  };

  // Launch custom practice from AI Coach
  const handleStartCustomPractice = (text: string, title: string) => {
    setCustomText(text);
    setCustomTextTitle(title);
    setMode('ai-challenge');
    setCurrentResult(null);
    setCurrentTab('practice');
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
    navigateToTab('practice');
  };

  const handleLogout = async () => {
    try {
      await signOutAccount();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    navigateToTab('practice');
  };

  return (
    <div className="min-h-screen flex flex-col relative text-[var(--color-text-main)] selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Dynamic Perspective Cosmic Background */}
      <CosmicBackground theme={theme} typingEnergy={typingEnergy} />

      {/* Animated Cosmic Cursor Aura */}
      <CursorAura typingEnergy={typingEnergy} />

      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => navigateToTab(tab)}
        user={user}
        resultsHistory={resultsHistory}
        onOpenAuth={(authMode) => {
          setAuthInitialMode(authMode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        currentTheme={theme}
        onThemeToggle={() => {
          setTheme((prev) => (prev === 'light' ? 'cosmic' : 'light'));
        }}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-[1880px] mx-auto px-4 sm:px-8 xl:px-12 py-6 flex flex-col justify-start">
        {/* TAB 1: PRACTICE & SPRINT WORKSPACE */}
        {currentTab === 'practice' && (
          <div className="flex flex-col gap-8 w-full">
            {/* Show Results HUD when test finished */}
            {currentResult ? (
              <ResultsHUD
                result={currentResult}
                bestWpm={user?.bestWpm || 0}
                avgWpm={user?.avgWpm || 0}
                onRetry={handleRetryTest}
                onNavigateToAiCoach={() => setCurrentTab('coach')}
                onNavigateToAnalytics={() => setCurrentTab('dashboard')}
                onStartWeaknessPractice={handleStartCustomPractice}
                userName={user?.name}
              />
            ) : (
              <>
                {/* Hero Headline Section */}
                <div className="text-center w-full max-w-5xl mx-auto mt-2 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Neural Typing Acceleration</span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none italic">
                    MASTER THE <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent not-italic font-extrabold">KEYBOARD</span>
                  </h1>
                  <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
                    One keystroke at a time. Train your fingers, calibrate your cadence, and enter your flow state.
                  </p>
                </div>

                {/* Configuration Bar */}
                <div className="w-full flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-lg">
                  {/* Mode Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto p-1 max-w-full">
                    {[
                      { id: 'classic', label: 'Classic' },
                      { id: 'time-attack', label: 'Time Attack' },
                      { id: 'precision', label: 'Precision' },
                      { id: 'code', label: 'Code' },
                      { id: 'quote', label: 'Quotes' },
                      { id: 'word-sprint', label: 'Word Sprint' },
                      { id: 'zen', label: 'Zen' },
                      { id: 'endless', label: 'Endless' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMode(m.id as TestMode);
                          setCustomText(undefined);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                          mode === m.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_14px_rgba(6,182,212,0.45)]'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Level & Duration Selectors */}
                  <div className="flex items-center gap-3 ml-auto">
                    {/* Level */}
                    {mode !== 'code' && mode !== 'quote' && (
                      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-sm font-semibold">
                        {(['easy', 'moderate', 'expert'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setLevel(lvl)}
                            className={`px-3 py-1.5 rounded-lg capitalize transition ${
                              level === lvl ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Duration / Words */}
                    {mode !== 'quote' && mode !== 'endless' && (
                      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-sm font-mono font-bold">
                        {(mode === 'word-sprint' ? [25, 50, 100] : [15, 30, 60, 120]).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setDuration(num)}
                            className={`px-3 py-1.5 rounded-lg transition ${
                              duration === num ? 'bg-cyan-500 text-black font-black' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Interactive Typing Engine with Increased Box Length & Endless Stream */}
                <TypingEngine
                  key={`${mode}-${level}-${duration}-${customTextTitle || ''}`}
                  mode={mode}
                  level={level}
                  duration={duration}
                  onComplete={handleTestComplete}
                  onKeyStroke={handleKeyStroke}
                  customText={customText}
                  isAiGenerated={!!customTextTitle}
                />

                {/* Real-time Interactive Keyboard Visualizer */}
                <div className="w-full mt-4">
                  <KeyboardVisualizer activeKey={activeKey} />
                </div>

                {/* Landing Page Supporting Sections */}
                <section className="w-full mt-16 pt-12 border-t border-sky-500/15 flex flex-col gap-16">
                  {/* How Type Sprint Works */}
                  <div>
                    <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                      <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
                        Methodology
                      </span>
                      <h2 className="text-3xl font-black text-white">How Type Sprint Works</h2>
                      <p className="text-slate-400 text-sm">
                        Engineered from the ground up for maximum neuromuscular speed and ergonomic longevity.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[
                        { step: '01', title: 'Take a Sprint', desc: 'Engage with endless continuous word streams or real code syntax.' },
                        { step: '02', title: 'Telemetry Audit', desc: 'Algorithms track millisecond latency across every finger zone.' },
                        { step: '03', title: 'Isolate Weak Keys', desc: 'Identify transition bottlenecks on outer periphery rows.' },
                        { step: '04', title: 'AI Personalized Drills', desc: 'Generate customized challenges targeted at your weaknesses.' },
                        { step: '05', title: 'Achieve Pure Flow', desc: 'Consistently break your speed ceiling with zero eye-strain.' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-[#060c1d]/75 border border-sky-500/15 backdrop-blur-md flex flex-col justify-between"
                        >
                          <span className="text-xl font-black font-mono text-cyan-400">{item.step}</span>
                          <div className="mt-4">
                            <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Highlights Grid */}
                  <div>
                    <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                      <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
                        Capabilities
                      </span>
                      <h2 className="text-3xl font-black text-white">Engineered for Perfection</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-7 rounded-3xl bg-[#060c1d]/85 border border-sky-500/20 backdrop-blur-xl">
                        <Brain className="w-8 h-8 text-cyan-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Neural AI Coach</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Biomechanical diagnostics reveal which fingers are responsible for accuracy drops and recommend specific calibration drills.
                        </p>
                      </div>

                      <div className="p-7 rounded-3xl bg-[#060c1d]/85 border border-sky-500/20 backdrop-blur-xl">
                        <Code className="w-8 h-8 text-emerald-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Real Syntax Code Mode</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Practice typing production JavaScript, Python, C++, HTML, and SQL with real brackets, quotes, indentation, and semicolons.
                        </p>
                      </div>

                      <div className="p-7 rounded-3xl bg-[#060c1d]/85 border border-sky-500/20 backdrop-blur-xl">
                        <Trophy className="w-8 h-8 text-amber-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Certified Credentials</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Generate high-resolution PNG achievement certificates with verifiable telemetry hashes to share with peers or employers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Frequently Asked Questions */}
                  <div>
                    <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
                      <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">Inquiries</span>
                      <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                      {[
                        {
                          q: 'How is Words Per Minute (WPM) calculated?',
                          a: 'We use the industry-standard formula: (correct characters ÷ 5) ÷ elapsed minutes. Raw WPM includes uncorrected keystrokes to illustrate gross output.',
                        },
                        {
                          q: 'How does the AI Typing Coach analyze my weaknesses?',
                          a: 'Our server-side neural engine measures character transition latency and error rates for every individual key, mapping them to anatomical finger zones to pinpoint exact friction points.',
                        },
                        {
                          q: 'Can I use Type Sprint completely offline?',
                          a: 'Yes. Type Sprint is a fully compliant Progressive Web App (PWA) with client-side service worker caching. Timed tests and history operate seamlessly without network connectivity.',
                        },
                      ].map((faq, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-[#060c1d]/80 border border-sky-500/15">
                          <h4 className="font-bold text-white text-sm mb-1.5">{faq.q}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Call to Action */}
                  <div className="p-10 rounded-3xl bg-gradient-to-r from-[#0a173d] via-[#091533] to-[#120f2e] border border-cyan-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      Ready to Enter Your Flow State?
                    </h2>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                      Join thousands of software engineers, writers, and competitive typists training on Type Sprint today.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        handleRetryTest();
                      }}
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(12,151,224,0.45)] transition hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Start Typing Now</span>
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* TAB 2: AI COACH VIEW */}
        {currentTab === 'coach' && (
          user ? (
            <AiCoachView
              user={user}
              recentResults={resultsHistory}
              onStartCustomPractice={handleStartCustomPractice}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-3xl bg-[#060c1d]/90 border border-sky-500/30 backdrop-blur-xl text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Biomechanical AI Coach</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sign in or create an account to unlock real-time neural error-correction, finger zone telemetry, and personalized weakness calibration drills.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('login')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(12,151,224,0.4)] transition"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('register')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 transition"
                >
                  Create Account
                </button>
              </div>
            </div>
          )
        )}

        {/* TAB 3: LEADERBOARD VIEW */}
        {currentTab === 'leaderboard' && <LeaderboardView />}

        {/* TAB 4: PRICING VIEW */}
        {currentTab === 'pricing' && (
          <PricingView user={user} onUpdateUser={(updated) => setUser(updated)} />
        )}

        {/* TAB 5: DASHBOARD VIEW */}
        {currentTab === 'dashboard' && (
          user ? (
            <DashboardView
              user={user}
              results={resultsHistory}
              achievements={achievements}
              onStartTest={() => {
                setCurrentResult(null);
                setCurrentTab('practice');
              }}
              onNavigateToAiCoach={() => setCurrentTab('coach')}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-3xl bg-[#060c1d]/90 border border-sky-500/30 backdrop-blur-xl text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Athlete Performance Dashboard</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sign in to view your complete typing cadence analytics, velocity progressions, and unlocked mastery badges.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('login')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('register')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-amber-400 transition"
                >
                  Create Account
                </button>
              </div>
            </div>
          )
        )}

        {/* TAB 6: PROFILE VIEW */}
        {currentTab === 'profile' && (
          user ? (
            <ProfileView
              user={user}
              results={resultsHistory}
              achievements={achievements}
              currentTheme={theme}
              onThemeChange={(t) => {
                setTheme(t);
                const updated = { ...user, themePreference: t };
                setUser(updated);
                syncProfileAndLeaderboard(user.id, updated).catch(() => {});
              }}
              onUpdateProfile={(updated) => setUser(updated)}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-3xl bg-[#060c1d]/90 border border-sky-500/30 backdrop-blur-xl text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Speed Athlete Profile</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sign in to customize your avatar, select themes, and export high-resolution achievement certificates.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('login')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(12,151,224,0.4)] transition"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('register')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 transition"
                >
                  Create Account
                </button>
              </div>
            </div>
          )
        )}

        {/* TAB 7: DEDICATED SIGN IN PAGE */}
        {currentTab === 'login' && (
          <LoginPageView
            onSuccess={handleAuthSuccess}
            onNavigateToRegister={() => setCurrentTab('register')}
            onNavigateToPractice={() => setCurrentTab('practice')}
          />
        )}

        {/* TAB 8: DEDICATED REGISTRATION PAGE */}
        {currentTab === 'register' && (
          <RegisterPageView
            onSuccess={handleAuthSuccess}
            onNavigateToLogin={() => setCurrentTab('login')}
            onNavigateToPractice={() => setCurrentTab('practice')}
          />
        )}

        {/* TAB 9: ADMIN VIEW (Strictly protected) */}
        {currentTab === 'admin' && (
          <AdminView
            user={user}
            onNavigateHome={() => {
              navigateToTab('practice');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 10: LEGAL PAGES (Privacy Policy & Terms of Service) */}
        {(currentTab === 'privacy' || currentTab === 'terms') && (
          <LegalView
            type={currentTab}
            onBackHome={() => {
              navigateToTab('practice');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSwitchType={(nextType) => navigateToTab(nextType)}
          />
        )}

        {/* TAB 11: CUSTOM 404 ERROR PAGE */}
        {currentTab === '404' && (
          <NotFoundView
            attemptedPath={unknownPath}
            onReturnHome={() => {
              navigateToTab('practice');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer with Direct Navigation Links */}
      <footer className="w-full border-t border-sky-500/15 py-8 px-6 mt-16 bg-[#020307]/90 backdrop-blur-xl text-xs text-slate-400">
        <div className="w-full max-w-[1880px] mx-auto px-4 sm:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCurrentTab('practice');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center text-left group cursor-pointer"
            >
              <img
                src="/assets/aistudio/logo_original.png"
                alt="Type Sprint Logo"
                className="h-9 sm:h-11 w-auto object-contain group-hover:scale-105 transition-all duration-200"
              />
            </button>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-slate-400">Train Your Fingers. Master Your Flow.</span>
          </div>

          {/* Quick Page Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 font-semibold text-slate-400">
            <button
              type="button"
              onClick={() => {
                setCurrentTab('practice');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-400 transition"
            >
              Practice
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('coach');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-400 transition"
            >
              AI Coach
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('leaderboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-400 transition"
            >
              Leaderboards
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('pricing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-400 transition"
            >
              Pricing
            </button>

            {/* When logged in: show Dashboard and Profile (Sign In and Create Account are removed) */}
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('profile');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition"
                >
                  Profile
                </button>
              </>
            ) : (
              /* When logged out: show Sign In and Create Account */
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('login');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('register');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition"
                >
                  Create Account
                </button>
              </>
            )}

            {/* Admin Console strictly visible only to shivadas.sw@gmail.com */}
            {user?.email?.toLowerCase().trim() === 'shivadas.sw@gmail.com' && (
              <button
                type="button"
                onClick={() => {
                  navigateToTab('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
              >
                <span>Admin Console</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                navigateToTab('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-400 transition"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => {
                navigateToTab('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-400 transition"
            >
              Terms of Service
            </button>
          </div>

          <span className="text-slate-600">© 2026 Type Sprint. All rights reserved.</span>
        </div>
      </footer>

      {/* Cookie & Storage Consent Banner */}
      <CookieConsentBanner
        onOpenPrivacy={() => {
          navigateToTab('privacy');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />
    </div>
  );
}
