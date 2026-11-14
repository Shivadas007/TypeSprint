import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AlertCircle, ShieldCheck, Cloud, ArrowLeft } from 'lucide-react';
import { signInWithGoogleAccount } from '../utils/firebaseStore';

interface LoginPageViewProps {
  onSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onNavigateToPractice: () => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToPractice,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const profile = await signInWithGoogleAccount();
      onSuccess(profile);
      onNavigateToPractice();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before finishing.');
      } else if (code === 'auth/popup-blocked') {
        setError('Your browser blocked the sign-in popup. Please allow popups and try again.');
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-10 animate-in fade-in duration-300">
      <div className="p-8 sm:p-9 rounded-3xl bg-[#070e24]/90 border border-sky-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified Google Authentication</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sign In to Type Sprint
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Access your cloud-synced typing telemetry, AI Coach diagnostics, and verified global leaderboard rank.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-sky-500/20 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>Persistent Athlete Sync</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Signing in with Google automatically restores your test history, Kinetic Energy Streak, and profile preferences across any device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition hover:scale-[1.01] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>{loading ? 'Signing In...' : 'Sign In with Google'}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToPractice}
            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Practicing as Guest</span>
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-sky-500/15 text-center text-xs text-slate-400">
          <span>New athlete? </span>
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="text-cyan-400 font-bold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
