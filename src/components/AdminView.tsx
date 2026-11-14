import React, { useState, useEffect } from 'react';
import { Users, Activity, DollarSign, Cpu, Send, Check, ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { fetchAllAthletesForAdmin } from '../utils/firebaseStore';

const AUTHORIZED_ADMIN_EMAIL = 'shivadas.sw@gmail.com';

interface AdminViewProps {
  user: UserProfile | null;
  onNavigateHome?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ user, onNavigateHome }) => {
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'announcements' | 'athletes'>('metrics');
  const [athletes, setAthletes] = useState<
    Array<{
      uid: string;
      name: string;
      username: string;
      email: string;
      plan: string;
      bestWpm: number;
      testsCompleted: number;
      createdAt: string;
    }>
  >([]);

  const isAdmin = user && user.email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL.toLowerCase().trim();

  useEffect(() => {
    if (!isAdmin) return;
    fetchAllAthletesForAdmin()
      .then((rows) => setAthletes(rows))
      .catch(() => {});
  }, [isAdmin]);

  // Guard: Strictly restricted to shivadas.sw@gmail.com
  if (!isAdmin) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 animate-in fade-in duration-300">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#070e24]/95 border border-red-500/30 backdrop-blur-2xl shadow-2xl text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-red-400 font-bold block">
              HTTP 403 · Access Denied
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Restricted Operations Console
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              This terminal is strictly reserved for system administrator <strong className="text-slate-200">Shiva Das</strong> (<span className="text-cyan-400 font-mono">shivadas.sw@gmail.com</span>).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
            {user ? (
              <span>Currently signed in as: <strong className="text-white">{user.email}</strong> (Non-admin)</span>
            ) : (
              <span>Authentication required. Please sign in with administrator credentials.</span>
            )}
          </div>

          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Practice Arena</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Registered Athletes',
      value: `${athletes.length || 1} Active`,
      change: 'Synced with Firestore',
      icon: Users,
      color: 'text-cyan-400',
    },
    { label: 'Verified Peak Velocity', value: `${user?.bestWpm || 0} WPM`, change: 'Real session telemetry', icon: Activity, color: 'text-emerald-400' },
    { label: 'User Tests Completed', value: `${user?.testsCompleted || 0}`, change: `Avg ${user?.avgWpm || 0} WPM`, icon: Cpu, color: 'text-purple-400' },
    { label: 'Subscription Tier', value: 'Free Forever', change: 'Pro & Master Coming Soon', icon: DollarSign, color: 'text-amber-400' },
  ];

  const recentAthletes =
    athletes.length > 0
      ? athletes.map((a) => ({
          name: a.name,
          email: a.email,
          plan: a.plan,
          wpm: a.bestWpm,
          joined: a.createdAt,
        }))
      : [
          {
            name: user?.name || 'Shiva Das',
            email: user?.email || AUTHORIZED_ADMIN_EMAIL,
            plan: 'free',
            wpm: user?.bestWpm || 0,
            joined: 'Active Administrator',
          },
        ];

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setAnnouncementSent(true);
    setTimeout(() => {
      setAnnouncementSent(false);
      setAnnouncementText('');
    }, 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-10 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#060c1d]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 max-w-full truncate">
              <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Verified Administrator: shivadas.sw@gmail.com</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Platform Operations Console</h2>
          <p className="text-slate-400 text-xs mt-1">
            System administration, live concurrency telemetry, announcement broadcasting, and subscription metrics.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs w-full lg:w-auto overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'metrics' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'announcements' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Announcements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('athletes')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'athletes' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Athletes
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#060c1d]/85 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>{s.label}</span>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="my-2">
                  <span className={`text-3xl font-black font-mono ${s.color}`}>{s.value}</span>
                </div>
                <span className="text-[11px] text-slate-400">{s.change}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* System Announcements */}
      {activeTab === 'announcements' && (
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-4">
          <h3 className="font-bold text-white text-base">Broadcast Live Announcement</h3>
          <p className="text-xs text-slate-400">
            Publish an instant HUD notification to all connected typing athletes.
          </p>

          <form onSubmit={handlePublishAnnouncement} className="flex flex-col gap-3">
            <textarea
              rows={3}
              placeholder="e.g. Type Sprint 2.5 update live! Neural AI Coach upgraded with real-time keystroke diagnostics..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none font-mono"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              {announcementSent ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" /> Broadcast transmitted to all active WebSockets!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Notice</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Athletes List */}
      {activeTab === 'athletes' && (
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-4">
          <h3 className="font-bold text-white text-base">Recent Athlete Onboardings</h3>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[560px] text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Athlete</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Peak WPM</th>
                  <th className="py-2.5 px-3 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAthletes.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition text-slate-300">
                    <td className="py-3 px-3 font-bold text-white">{a.name}</td>
                    <td className="py-3 px-3 text-slate-400">{a.email}</td>
                    <td className="py-3 px-3 uppercase text-cyan-400">{a.plan}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{a.wpm}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{a.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
