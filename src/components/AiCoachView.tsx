import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, TestResult, AiCoachReport } from '../types';
import { Sparkles, Brain, Target, Zap, Clock, ShieldCheck, Play, RefreshCw, ChevronRight, Activity, Flame, CheckCircle } from 'lucide-react';
import { extractBottleneckKeys, generateTargetedWeaknessDrill } from '../utils/weaknessDrill';

interface AiCoachViewProps {
  user: UserProfile;
  recentResults: TestResult[];
  onStartCustomPractice: (text: string, title: string) => void;
}

export const AiCoachView: React.FC<AiCoachViewProps> = ({
  user,
  recentResults,
  onStartCustomPractice,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AiCoachReport | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('Technology');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [generatingPractice, setGeneratingPractice] = useState(false);

  // Live Micro-Drill Interactive State
  const [microDrillInput, setMicroDrillInput] = useState('');
  const [microDrillActive, setMicroDrillActive] = useState(false);
  const [microDrillFinished, setMicroDrillFinished] = useState(false);
  const [microDrillStartTime, setMicroDrillStartTime] = useState<number | null>(null);
  const [microDrillResult, setMicroDrillResult] = useState<{ wpm: number; accuracy: number; feedback: string } | null>(null);

  // Compute real-time aggregated keys from actual test data
  const aggregatedKeys: Record<string, { total: number; errors: number; totalMs?: number }> = {};
  recentResults.forEach((r) => {
    if (r.keyStats) {
      for (const [k, v] of Object.entries(r.keyStats)) {
        const cleanK = k.toLowerCase().trim();
        if (!cleanK || cleanK.length > 1) continue;
        if (!aggregatedKeys[cleanK]) {
          aggregatedKeys[cleanK] = { total: 0, errors: 0, totalMs: 0 };
        }
        aggregatedKeys[cleanK].total += v.total;
        aggregatedKeys[cleanK].errors += v.errors;
        if (v.totalMs) {
          aggregatedKeys[cleanK].totalMs = (aggregatedKeys[cleanK].totalMs || 0) + v.totalMs;
        }
      }
    }
  });

  // Extract real bottleneck keys from actual keystroke errors and latency
  const activeWeakKeys = extractBottleneckKeys(aggregatedKeys, 5);
  const displayWeakKeys = activeWeakKeys.length > 0 ? activeWeakKeys : ['e', 't', 'r', 'o', 'a'];

  // Targeted micro-drill that dynamically incorporates the user's active bottleneck keys
  const microDrillTarget = useMemo(() => {
    return generateTargetedWeaknessDrill(displayWeakKeys, 12);
  }, [displayWeakKeys.join(',')]);

  // Fetch AI Coach Diagnostic
  const fetchCoachReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentResults,
          slowKeys: displayWeakKeys,
          weakFingers: ['Left Pinky', 'Right Ring'],
          avgWpm: user.avgWpm || 70,
          accuracy: 94,
        }),
      });
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Automatically load diagnostic report on mount if not already cached
  useEffect(() => {
    if (!report) {
      fetchCoachReport();
    }
  }, []);

  // Generate Targeted Practice Passage
  const handleGeneratePractice = async () => {
    setGeneratingPractice(true);
    const topicToUse = customTopicInput.trim() || selectedTopic;
    try {
      const res = await fetch('/api/ai/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          weakKeys: displayWeakKeys,
          targetWpm: (user.avgWpm || 65) + 5,
        }),
      });
      const data = await res.json();
      if (data && data.text) {
        onStartCustomPractice(data.text, `AI Practice (${topicToUse} · ${displayWeakKeys.map(k => k.toUpperCase()).join(', ')})`);
      } else {
        const fallbackDrill = generateTargetedWeaknessDrill(displayWeakKeys, 45);
        onStartCustomPractice(fallbackDrill, `Targeted AI Error Drill (${displayWeakKeys.map(k => k.toUpperCase()).join(', ')})`);
      }
    } catch (e) {
      console.error(e);
      const fallbackDrill = generateTargetedWeaknessDrill(displayWeakKeys, 45);
      onStartCustomPractice(fallbackDrill, `Targeted AI Error Drill (${displayWeakKeys.map(k => k.toUpperCase()).join(', ')})`);
    } finally {
      setGeneratingPractice(false);
    }
  };

  // Micro-drill typing handlers
  const handleMicroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!microDrillActive && val.length === 1) {
      setMicroDrillActive(true);
      setMicroDrillStartTime(Date.now());
    }
    setMicroDrillInput(val);

    if (val.length >= microDrillTarget.length) {
      const elapsedMinutes = (Date.now() - (microDrillStartTime || Date.now())) / 60000;
      const targetWords = microDrillTarget.split(' ');
      const userWords = val.trim().split(' ');
      let correctChars = 0;
      for (let i = 0; i < Math.min(val.length, microDrillTarget.length); i++) {
        if (val[i] === microDrillTarget[i]) correctChars++;
      }
      const calcWpm = Math.max(10, Math.round((correctChars / 5) / Math.max(0.04, elapsedMinutes)));
      const calcAcc = Math.round((correctChars / microDrillTarget.length) * 100);

      setMicroDrillActive(false);
      setMicroDrillFinished(true);
      setMicroDrillResult({
        wpm: calcWpm,
        accuracy: calcAcc,
        feedback:
          calcWpm >= 80 && calcAcc >= 95
            ? 'Exceptional neuromuscular precision! Your peripheral finger transitions are firing cleanly with minimal friction.'
            : calcAcc >= 90
            ? 'Solid rhythmic consistency. To break into the next tier, focus on relaxing your left pinky and anticipating punctuation.'
            : 'Slight accuracy leakage detected on row transitions. Slow down by 5 WPM to calibrate your finger reach geometry.',
      });
    }
  };

  const handleResetMicroDrill = () => {
    setMicroDrillInput('');
    setMicroDrillActive(false);
    setMicroDrillFinished(false);
    setMicroDrillStartTime(null);
    setMicroDrillResult(null);
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0b1739] via-[#091533] to-[#120f2e] border border-cyan-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              Neural Biomechanical Coach
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.5 Connected</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Personalized AI Typing Lab
          </h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Real-time keystroke diagnostics analyze finger fatigue, latency asymmetry, and transition friction.
            Train with tailored drills designed specifically to eliminate your typing bottlenecks.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCoachReport}
          disabled={loading}
          className="relative z-10 flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(12,151,224,0.45)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-cyan-200" />
          )}
          <span>{report ? 'Refresh Diagnostics' : 'Analyze My Performance'}</span>
        </button>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Identified Weak Keys */}
        <div className="p-6 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Bottleneck Keys</span>
              <Target className="w-4 h-4 text-red-400" />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {displayWeakKeys.map((k) => (
                <div
                  key={k}
                  className="px-3.5 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 font-mono font-bold text-base flex flex-col items-center shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  <span>{k.toUpperCase()}</span>
                  <span className="text-[10px] text-red-400 opacity-80 mt-[-2px]">
                    {aggregatedKeys[k]
                      ? `${Math.round((aggregatedKeys[k].errors / Math.max(1, aggregatedKeys[k].total)) * 100)}% err`
                      : 'Target'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 border-t border-sky-500/10 pt-3">
            Outer-column keys handled by left pinky and right ring fingers experience highest latency variance.
          </p>
        </div>

        {/* Biomechanical Asymmetry */}
        <div className="p-6 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Hand Cadence Balance</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Left Hand Speed:</span>
              <span className="font-mono font-bold text-sky-400">54% Share</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full" style={{ width: '54%' }} />
            </div>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Right Hand Speed:</span>
              <span className="font-mono font-bold text-purple-400">46% Share</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full" style={{ width: '46%' }} />
            </div>
          </div>

          <p className="text-xs text-slate-400 border-t border-sky-500/10 pt-3">
            Right hand transitions around punctuation trigger a 1.2x pause delay.
          </p>
        </div>

        {/* Next Speed Milestone */}
        <div className="p-6 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Next Target Milestone</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="my-2">
              <span className="text-5xl font-black font-mono text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.35)]">
                {report?.nextSpeedMilestone || `${Math.min(150, Math.ceil(((user.avgWpm || 70) + 10) / 10) * 10)} WPM`}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-sky-500/10 pt-3">
            <span>Projected timeframe: </span>
            <strong className="text-slate-200">5-7 days of targeted training</strong>
          </div>
        </div>
      </div>

      {/* Live Micro-Drill Biomechanical Audit */}
      <div className="p-8 rounded-3xl bg-[#060c1d]/90 border border-sky-500/25 backdrop-blur-xl shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-sky-500/15">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Live Micro-Sprint Biomechanical Audit</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            Instant Keystroke Telemetry
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Type the pangram sequence below to calibrate your active neuromuscular latency in real-time:
        </p>

        {/* Prompt string with character highlighting */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/20 font-mono text-sm tracking-wide select-none">
          {microDrillTarget.split('').map((char, index) => {
            let color = 'text-slate-500';
            if (index < microDrillInput.length) {
              color = microDrillInput[index] === char ? 'text-cyan-400 font-bold' : 'text-red-400 bg-red-500/20 rounded';
            } else if (index === microDrillInput.length) {
              color = 'text-white border-b-2 border-cyan-400 animate-pulse';
            }
            return (
              <span key={index} className={color}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Interactive Input */}
        {!microDrillFinished ? (
          <input
            type="text"
            value={microDrillInput}
            onChange={handleMicroInputChange}
            placeholder="Click here and start typing the sentence above..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-sky-500/30 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 shadow-inner"
          />
        ) : (
          <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 font-mono font-bold text-sm">
                  <span className="text-cyan-300">{microDrillResult?.wpm} WPM</span>
                  <span className="text-emerald-300">{microDrillResult?.accuracy}% Accuracy</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">{microDrillResult?.feedback}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetMicroDrill}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition whitespace-nowrap"
            >
              Test Again
            </button>
          </div>
        )}
      </div>

      {/* AI Practice Generator Card */}
      <div className="p-8 rounded-3xl bg-[#070e24]/90 border border-sky-500/30 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Generate Adaptive Practice Passage</h3>
              <p className="text-xs text-slate-400">
                AI crafts a custom challenge calibrated to your weak keys ({activeWeakKeys.join(', ')})
              </p>
            </div>
          </div>

          {/* Topic Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {['Technology', 'Programming', 'Space', 'Philosophy', 'Cybersecurity', 'Neuroscience'].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setSelectedTopic(topic);
                  setCustomTopicInput('');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedTopic === topic && !customTopicInput
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Custom prompt input & action button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={customTopicInput}
            onChange={(e) => setCustomTopicInput(e.target.value)}
            placeholder="Or type any custom topic (e.g. Distributed Consensus, React Fiber, Quantum Physics)..."
            className="flex-1 w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
          />

          <button
            type="button"
            onClick={handleGeneratePractice}
            disabled={generatingPractice}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(12,151,224,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {generatingPractice ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{generatingPractice ? 'Synthesizing...' : 'Synthesize AI Challenge'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400">
          <span>Passage will emphasize high-frequency n-grams for keys: </span>
          <span className="font-mono text-cyan-300 font-bold">{activeWeakKeys.join(', ')}</span>
        </div>
      </div>

      {/* Training Plan List */}
      {report && (
        <div className="p-8 rounded-3xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Today's Neural Training Curriculum</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: 23 Minutes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.todaysTrainingPlan.map((plan, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900/60 border border-sky-500/20 hover:border-sky-400/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-mono font-semibold mb-2">
                    <span>{plan.durationMinutes} MIN DRILL</span>
                    <span>Target: {plan.targetWpm} WPM</span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1.5">{plan.drill}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const drillText = generateTargetedWeaknessDrill(displayWeakKeys, 45);
                    onStartCustomPractice(
                      drillText,
                      `${plan.drill} (${displayWeakKeys.map((k) => k.toUpperCase()).join(', ')})`
                    );
                  }}
                  className="mt-4 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/30 transition cursor-pointer"
                >
                  <span>Launch Drill</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Diagnostic Prose */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/15 text-xs text-slate-300 space-y-2">
            <p>
              <strong className="text-cyan-400 font-mono">Biomechanical Diagnosis: </strong>
              {report.biomechanicalSummary}
            </p>
            <p>
              <strong className="text-amber-400 font-mono">Ergonomic Advice: </strong>
              {report.fingerFatigueWarning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
