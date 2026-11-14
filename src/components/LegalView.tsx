import React from 'react';
import { Shield, FileText, ArrowLeft, Lock, Database, CheckCircle2 } from 'lucide-react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  onBackHome: () => void;
  onSwitchType: (type: 'privacy' | 'terms') => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onBackHome, onSwitchType }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Practice</span>
        </button>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onSwitchType('privacy')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg transition ${
              type === 'privacy' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => onSwitchType('terms')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg transition ${
              type === 'terms' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terms of Service
          </button>
        </div>
      </div>

      <article className="p-5 sm:p-10 rounded-2xl sm:rounded-3xl bg-[#060c1d]/90 border border-sky-500/25 backdrop-blur-xl shadow-2xl space-y-6">
        {type === 'privacy' ? (
          <>
            <header className="border-b border-sky-500/15 pb-5 sm:pb-6 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Legal & Data Protection</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-slate-400 font-mono">Last Updated: November 13, 2026</p>
            </header>

            <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Type Sprint respects your privacy and is engineered to keep your typing telemetry under your direct control. This policy explains what data is collected, how it is stored, and your rights when using our platform.
              </p>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>1. Data Stored Locally on Your Device</span>
                </h2>
                <p className="text-slate-400">
                  Your typing speed results, accuracy rates, keystroke bottleneck analytics, daily kinetic streaks, theme preferences, and achievements are stored locally in your browser via <code className="font-mono text-cyan-300">localStorage</code> and offline Service Worker cache. We do not sell or monetize your personal typing logs.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>2. Account Information & Security</span>
                </h2>
                <p className="text-slate-400">
                  When you choose to sign in with Google via Firebase Authentication, we store your display name, public leaderboard handle, avatar URL, and verified email address securely in Google Cloud Firestore. Your email address is strictly isolated to your private profile and is never exposed on public leaderboards. All communications in production are encrypted over HTTPS/TLS.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>3. AI Coach & Analytics</span>
                </h2>
                <p className="text-slate-400">
                  When requesting AI Coaching diagnostics or custom bottleneck drills, anonymized performance summaries (such as WPM, accuracy percentage, and weak keys) are processed on our server to generate personalized training exercises. No raw keystroke logs outside active typing tests are retained.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">4. Cookies & Your Controls</h2>
                <p className="text-slate-400">
                  Essential storage is required for session authentication and saving your preferences. Optional analytics cookies only load if you explicitly click "Accept All" on our consent banner. You can export a full JSON backup of your cached data or sign out at any time from your Profile page.
                </p>
              </div>
            </section>
          </>
        ) : (
          <>
            <header className="border-b border-sky-500/15 pb-6 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Platform Agreement</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Terms of Service</h1>
              <p className="text-xs text-slate-400 font-mono">Last Updated: November 13, 2026</p>
            </header>

            <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                By accessing or using Type Sprint, you agree to be bound by these Terms of Service. Please read them carefully before registering an account or participating in leaderboard rankings.
              </p>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">1. Fair Play & Leaderboard Integrity</h2>
                <p className="text-slate-400">
                  All typing tests submitted to Type Sprint must reflect authentic human keyboard input. Automated typing bots, browser scripts, macro injectors, or clipboard pasting tools are strictly prohibited and may result in score removal or account suspension.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">2. User Accounts & Acceptable Use</h2>
                <p className="text-slate-400">
                  You are responsible for maintaining the confidentiality of your account credentials and choosing an appropriate, respectful username. You agree not to probe, overload, or attempt unauthorized access to platform APIs or other users' accounts.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">3. Service Availability & Plans</h2>
                <p className="text-slate-400">
                  Core typing practice modes, telemetry analytics, and certificates are provided under our Free Forever Starter tier. Upcoming Pro and Grandmaster subscription tiers are currently marked as Coming Soon and carry no billing obligations until formally launched.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">4. Intellectual Property</h2>
                <p className="text-slate-400">
                  The Type Sprint brand, custom visual designs, biomechanical coaching engine, and downloadable achievement certificate layouts remain the property of Type Sprint. Generated achievement certificates may be shared freely for personal, educational, or professional portfolios.
                </p>
              </div>
            </section>
          </>
        )}
      </article>
    </div>
  );
};
