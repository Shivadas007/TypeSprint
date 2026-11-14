import React, { useState, useEffect } from 'react';
import { Crown, Search, Globe } from 'lucide-react';
import { PublicLeaderboardEntry, subscribeLeaderboard } from '../utils/firebaseStore';
import { DEFAULT_CARTOON_AVATAR_FALLBACK } from '../utils/avatars';

export const LeaderboardView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [entries, setEntries] = useState<PublicLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeLeaderboard(
      (liveEntries) => {
        setEntries(liveEntries);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [timeframe]);

  const filtered = entries.filter(
    (e) =>
      e.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = entries.slice(0, 3);
  const remaining = filtered.slice(searchTerm ? 0 : 3);

  return (
    <div className="w-full flex flex-col gap-8 pb-12 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
          <Globe className="w-3.5 h-3.5" />
          <span>Global Speed Ranking Tier</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Cosmic Sprint Leaderboards
        </h2>
        <p className="text-slate-400 text-sm">
          Real-time verified rankings synced directly from registered athlete profiles.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                timeframe === t
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'allTime' ? 'All Time' : t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search typist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {!searchTerm && topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          {topThree[1] && (
            <div className="order-2 md:order-1 p-6 rounded-3xl bg-gradient-to-b from-[#091530] to-[#040816] border border-slate-400/40 backdrop-blur-xl shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-3 left-4 text-xs font-mono font-bold text-slate-400">#2 SILVER</div>
              <div className="w-16 h-16 rounded-full border-2 border-slate-300 p-1 mb-3 shadow-[0_0_20px_rgba(203,213,225,0.4)]">
                <img
                  src={topThree[1].avatarUrl || DEFAULT_CARTOON_AVATAR_FALLBACK}
                  alt={topThree[1].username}
                  className="w-full h-full rounded-full bg-slate-900 object-cover"
                />
              </div>
              <h4 className="font-bold text-white text-base">{topThree[1].name}</h4>
              <span className="text-xs font-mono text-slate-400">@{topThree[1].username}</span>

              <div className="my-4">
                <span className="text-4xl font-black font-mono text-slate-200">{topThree[1].wpm}</span>
                <span className="text-xs text-slate-400 block uppercase">WPM</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>{topThree[1].accuracy}% acc</span>
                <span>·</span>
                <span>{topThree[1].tests} tests</span>
              </div>
            </div>
          )}

          {topThree[0] && (
            <div className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-[#1c1808] via-[#0d1633] to-[#040816] border-2 border-amber-400/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col items-center text-center relative overflow-hidden md:scale-105">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 mb-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>CHAMPION</span>
              </div>

              <div className="w-20 h-20 rounded-full border-2 border-amber-400 p-1.5 mb-3 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                <img
                  src={topThree[0].avatarUrl || DEFAULT_CARTOON_AVATAR_FALLBACK}
                  alt={topThree[0].username}
                  className="w-full h-full rounded-full bg-slate-900 object-cover"
                />
              </div>
              <h4 className="font-extrabold text-white text-lg">{topThree[0].name}</h4>
              <span className="text-xs font-mono text-amber-300">@{topThree[0].username}</span>

              <div className="my-4">
                <span className="text-5xl font-black font-mono text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  {topThree[0].wpm}
                </span>
                <span className="text-xs text-slate-300 block uppercase font-bold">WPM</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                <span className="text-emerald-400 font-bold">{topThree[0].accuracy}% acc</span>
                <span>·</span>
                <span>{topThree[0].tests} tests</span>
              </div>
            </div>
          )}

          {topThree[2] && (
            <div className="order-3 p-6 rounded-3xl bg-gradient-to-b from-[#180e07] to-[#040816] border border-orange-600/40 backdrop-blur-xl shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-3 left-4 text-xs font-mono font-bold text-orange-400">#3 BRONZE</div>
              <div className="w-16 h-16 rounded-full border-2 border-orange-500 p-1 mb-3 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                <img
                  src={topThree[2].avatarUrl || DEFAULT_CARTOON_AVATAR_FALLBACK}
                  alt={topThree[2].username}
                  className="w-full h-full rounded-full bg-slate-900 object-cover"
                />
              </div>
              <h4 className="font-bold text-white text-base">{topThree[2].name}</h4>
              <span className="text-xs font-mono text-slate-400">@{topThree[2].username}</span>

              <div className="my-4">
                <span className="text-4xl font-black font-mono text-orange-400">{topThree[2].wpm}</span>
                <span className="text-xs text-slate-400 block uppercase">WPM</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>{topThree[2].accuracy}% acc</span>
                <span>·</span>
                <span>{topThree[2].tests} tests</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-6 rounded-3xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl overflow-x-auto">
        {loading ? (
          <div className="py-10 text-center text-xs font-mono text-slate-400">
            Loading live global rankings...
          </div>
        ) : remaining.length === 0 && topThree.length === 0 ? (
          <div className="py-10 text-center text-xs font-mono text-slate-400">
            No ranked athletes yet. Sign in and complete a sprint to claim #1.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-mono tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Typist</th>
                <th className="py-3 px-4">Tier Badge</th>
                <th className="py-3 px-4">WPM</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Consistency</th>
                <th className="py-3 px-4 text-right">Tests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {remaining.map((item) => (
                <tr key={item.uid} className="hover:bg-slate-800/30 transition text-slate-300">
                  <td className="py-3.5 px-4 font-bold text-slate-400">#{item.rank}</td>
                  <td className="py-3.5 px-4 font-sans">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatarUrl || DEFAULT_CARTOON_AVATAR_FALLBACK}
                        alt={item.username}
                        className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 object-cover"
                      />
                      <div>
                        <span className="font-semibold text-white block text-sm">{item.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">@{item.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {item.badge}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-cyan-300 font-bold text-sm">{item.wpm}</td>
                  <td className="py-3.5 px-4 text-emerald-400">{item.accuracy}%</td>
                  <td className="py-3.5 px-4 text-purple-400">{item.consistency}%</td>
                  <td className="py-3.5 px-4 text-right text-slate-400">{item.tests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
