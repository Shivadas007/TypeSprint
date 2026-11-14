import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AlertCircle, ShieldCheck, Sparkles, Cloud } from 'lucide-react';
import { signInWithGoogleAccount } from '../utils/firebaseStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const profile = await signInWithGoogleAccount();
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in window was closed before completing authentication.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setError('Unable to complete Google Sign-In. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#070e24] border border-sky-500/30 rounded-3xl p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-sky-500/20 mb-5">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {mode === 'login' ? 'Sign In to Type Sprint' : 'Join Type Sprint'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'login'
                ? 'Sync your telemetry, streaks, and global leaderboard rank.'
                : 'Create your cloud-synced typing athlete profile in one click.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="text-slate-400 hover:text-white font-bold text-lg px-1.5"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-sky-500/20 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <Cloud className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Persistent Cloud Sync Enabled</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Your typing history, Kinetic Energy Streak, custom avatar, and verified WPM scores are securely backed up with Google Authentication & Firestore.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
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
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Free Forever · Verified Identity · Zero Password Risk</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-sky-500/15 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              New to Type Sprint?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="text-cyan-400 font-bold hover:underline"
              >
                Create free account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
