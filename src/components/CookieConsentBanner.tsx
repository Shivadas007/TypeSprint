import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie } from 'lucide-react';
import { getCookieConsent, setCookieConsent, initAnalyticsIfConfigured } from '../utils/analytics';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      setVisible(true);
    } else if (existing === 'accepted') {
      initAnalyticsIfConfigured();
    }
  }, []);

  if (!visible) return null;

  const handleChoice = (choice: 'accepted' | 'essential') => {
    setCookieConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie and Storage Preferences"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-4xl mx-auto p-4 sm:px-6 sm:py-4 rounded-2xl bg-[#070e24]/95 border border-sky-500/35 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
          <Cookie className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-white mb-0.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your Privacy & Local Storage</span>
          </p>
          <p className="text-slate-400">
            Type Sprint uses essential browser storage to save your typing speed history, streak, and theme preferences. Optional analytics help us improve performance. Read our{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-cyan-400 underline hover:text-cyan-300 font-medium"
            >
              Privacy Policy
            </button>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={() => handleChoice('essential')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition whitespace-nowrap"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={() => handleChoice('accepted')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_16px_rgba(12,151,224,0.4)] transition whitespace-nowrap"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};
