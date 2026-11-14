import React from 'react';
import { Compass, ArrowLeft, Keyboard } from 'lucide-react';

interface NotFoundViewProps {
  attemptedPath?: string;
  onReturnHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ attemptedPath, onReturnHome }) => {
  return (
    <div className="w-full max-w-xl mx-auto my-14 p-8 sm:p-10 rounded-3xl bg-[#060c1d]/90 border border-sky-500/30 backdrop-blur-2xl text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(12,151,224,0.2)]">
        <Compass className="w-10 h-10 text-cyan-400" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
          Error 404 · Route Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Lost Your Flow?
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          The page {attemptedPath ? <code className="font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-slate-900">{attemptedPath}</code> : 'you requested'} does not exist or may have been moved.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReturnHome}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(12,151,224,0.4)] transition hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </button>

        <button
          type="button"
          onClick={onReturnHome}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition"
        >
          <Keyboard className="w-4 h-4 text-cyan-400" />
          <span>Start Typing Test</span>
        </button>
      </div>
    </div>
  );
};
