import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Check, Clock, X } from 'lucide-react';

interface PricingViewProps {
  user?: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ user }) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');
  const [comingSoonPlan, setComingSoonPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      badge: 'Active & Free Forever',
      price: currency === 'INR' ? '₹0' : '$0',
      period: 'forever',
      description: 'Core typing speed tests, basic statistics, and global leaderboard access.',
      features: [
        'Unlimited Classic typing tests',
        'Standard 15s, 30s, 60s timed sessions',
        'Basic accuracy and raw speed metrics',
        'Global and regional leaderboards',
        'Core achievement unlocking system',
        'Offline typing engine support',
      ],
      cta: 'Free Forever',
      isComingSoon: false,
    },
    {
      id: 'pro',
      name: 'Pro Typist',
      badge: 'Coming Soon',
      price:
        currency === 'INR'
          ? interval === 'annual'
            ? '₹159'
            : '₹199'
          : interval === 'annual'
          ? '$3.19'
          : '$3.99',
      period: 'per month',
      description: 'Unlock AI Typing Coach, code typing, weak-key training drills, and deep analytics.',
      features: [
        'Everything in Starter tier',
        'Neural AI Typing Coach with daily custom drills',
        'Adaptive practice generator calibrated to weak keys',
        'Code Mode: JavaScript, Python, C++, HTML, SQL',
        'Precision, Time-Attack & Endless modes',
        'Weak-key tactile diagnostic heatmap',
        'Downloadable certified performance credentials',
        '7-day free trial included',
      ],
      cta: 'Coming Soon',
      isComingSoon: true,
    },
    {
      id: 'master',
      name: 'Grandmaster',
      badge: 'Coming Soon',
      price:
        currency === 'INR'
          ? interval === 'annual'
            ? '₹399'
            : '₹499'
          : interval === 'annual'
          ? '$6.39'
          : '$7.99',
      period: 'per month',
      description: 'Continuous biomechanical neural diagnosis, unlimited AI custom passages, and exclusive cosmic themes.',
      features: [
        'Everything in Pro tier',
        'Unlimited AI practice generation across all domains',
        'Deep neuromotor fatigue & cadence analysis',
        'Exclusive Cosmic Cyber & Aurora master themes',
        'Priority early access to new typing modes',
        'Dedicated typing curriculum roadmap',
        'Verified Grandmaster badge on public leaderboards',
      ],
      cta: 'Coming Soon',
      isComingSoon: true,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-10 sm:pb-12 animate-in fade-in duration-300">
      {/* Title & Currency Switcher */}
      <div className="text-center max-w-2xl mx-auto space-y-3 px-1">
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Invest in Your Typing Velocity
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Master keyboard mechanics with AI-powered coaching, real-time biomechanical diagnostics, and custom training.
        </p>

        {/* Currency & Billing Interval Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
          {/* Monthly / Annual Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInterval('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                interval === 'monthly' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval('annual')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                interval === 'annual' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] text-emerald-300 font-mono font-bold">20% OFF</span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currency === 'INR' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currency === 'USD' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {plans.map((p) => {
          if (p.isComingSoon) {
            // Faded Pro & Grandmaster Subscriptions (Nothing else shown instead of Coming Soon)
            return (
              <div
                key={p.id}
                onClick={() => setComingSoonPlan(p.name)}
                className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 relative bg-[#060c1d]/50 border-2 border-dashed border-slate-700/60 opacity-50 hover:opacity-75 filter grayscale-[20%] hover:scale-[1.01] cursor-pointer shadow-lg group select-none"
              >
                {/* Coming Soon Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-300 group-hover:text-white transition">
                    {p.name}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    Coming Soon
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{p.description}</p>

                {/* Price Display */}
                <div className="my-5 pb-5 border-b border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black font-mono text-slate-300 tracking-tight">{p.price}</span>
                    <span className="text-xs text-slate-500">/{p.period}</span>
                  </div>
                  {interval === 'annual' && (
                    <span className="text-[11px] text-slate-500 font-mono block mt-1">
                      Billed annually (save 20%)
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-8">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                      <Check className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Button: Strictly shows Coming Soon with no activation/deactivation */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setComingSoonPlan(p.name);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-900/90 text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:scale-[1.02] active:scale-95"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Coming Soon</span>
                </button>
              </div>
            );
          }

          // Active Starter Plan (Free Tier)
          return (
            <div
              key={p.id}
              className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl backdrop-blur-2xl flex flex-col justify-between transition-all duration-200 relative bg-[#060c1d]/90 border border-cyan-500/30 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{p.description}</p>

                {/* Price Display */}
                <div className="my-5 pb-5 border-b border-sky-500/10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black font-mono text-white tracking-tight">{p.price}</span>
                    <span className="text-xs text-slate-400">/{p.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-8">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter CTA */}
              <div className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs text-center uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                Active Tier (Free Forever)
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Interactive Modal */}
      {comingSoonPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setComingSoonPlan(null)}
        >
          <div
            className="w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-[#070e24] border border-amber-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center gap-4 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setComingSoonPlan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold px-2 py-1 text-sm rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-white tracking-tight">Coming Soon</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The <strong className="text-amber-300 font-semibold">{comingSoonPlan}</strong> subscription is currently in development and will be available soon.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setComingSoonPlan(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg transition hover:scale-[1.02] active:scale-95 cursor-pointer mt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
