import React, { useEffect, useRef, useState } from 'react';
import { TestResult, KeyHeatmapInfo } from '../types';
import { KeyboardVisualizer } from './KeyboardVisualizer';
import { RotateCcw, Share2, Sparkles, TrendingUp, Award, Download, Copy, Check, BarChart2 } from 'lucide-react';
import { extractBottleneckKeys, generateTargetedWeaknessDrill } from '../utils/weaknessDrill';

interface ResultsHUDProps {
  result: TestResult;
  bestWpm: number;
  avgWpm: number;
  onRetry: () => void;
  onNavigateToAiCoach: () => void;
  onNavigateToAnalytics: () => void;
  onStartWeaknessPractice?: (text: string, title: string) => void;
  userName?: string;
}

export const ResultsHUD: React.FC<ResultsHUDProps> = ({
  result,
  bestWpm,
  avgWpm,
  onRetry,
  onNavigateToAiCoach,
  onNavigateToAnalytics,
  onStartWeaknessPractice,
  userName = 'Shiva Das',
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [certRecipient, setCertRecipient] = useState(userName);
  const [copied, setCopied] = useState(false);
  const [isGeneratingDrill, setIsGeneratingDrill] = useState(false);

  // Extract real-time bottleneck keys from this specific test's keystroke telemetry
  const bottleneckKeys = extractBottleneckKeys(result.keyStats, 5);

  const handleTrainWeakness = async () => {
    setIsGeneratingDrill(true);
    try {
      const keysToTarget = bottleneckKeys.length > 0 ? bottleneckKeys : ['e', 't', 'a', 'o', 'r'];
      let drillText = '';

      try {
        const res = await fetch('/api/ai/generate-practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weakKeys: keysToTarget,
            currentWpm: result.wpm,
            difficulty: 'targeted',
            wordCount: 40,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            drillText = data.text;
          }
        }
      } catch (e) {
        console.warn('AI generator fallback to client drill', e);
      }

      if (!drillText) {
        drillText = generateTargetedWeaknessDrill(keysToTarget, 50);
      }

      const keyLabel = keysToTarget.map((k) => k.toUpperCase()).join(' · ');
      if (onStartWeaknessPractice) {
        onStartWeaknessPractice(drillText, `AI Error Correction Drill (${keyLabel})`);
      } else {
        onNavigateToAiCoach();
      }
    } finally {
      setIsGeneratingDrill(false);
    }
  };

  // Preload logo for certificate renderer
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/aistudio/logo_original.png';
    img.onload = () => {
      logoImageRef.current = img;
    };
  }, []);

  const isPb = result.wpm > bestWpm && bestWpm > 0;
  const diffFromAvg = avgWpm > 0 ? result.wpm - avgWpm : 0;

  // Transform keyStats into heatmap map
  const weakKeysMap: Record<string, KeyHeatmapInfo> = {};
  if (result.keyStats) {
    for (const [key, data] of Object.entries(result.keyStats)) {
      const errRate = data.total > 0 ? data.errors / data.total : 0;
      weakKeysMap[key.toLowerCase()] = {
        key,
        errorRate: errRate,
        totalTyped: data.total,
        fingerZone: 'index',
        hand: 'left',
      };
    }
  }

  // Draw Speed Curve Chart
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = (canvas.width = rect.width * dpr);
    const h = (canvas.height = rect.height * dpr);
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const samples = result.wpmPerSecond.length > 0 ? result.wpmPerSecond : [result.wpm];
    const maxVal = Math.max(bestWpm, ...samples, 40) * 1.15;
    const padL = 40;
    const padR = 15;
    const padT = 20;
    const padB = 30;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();

      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(val), padL - 8, y + 3);
    }

    // Best WPM reference line
    if (bestWpm > 0) {
      const bestY = padT + chartH - (bestWpm / maxVal) * chartH;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padL, bestY);
      ctx.lineTo(width - padR, bestY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`Best: ${bestWpm}`, width - padR - 5, bestY - 6);
    }

    if (samples.length < 2) {
      // Draw single bar
      ctx.fillStyle = '#0C97E0';
      ctx.fillRect(padL + chartW / 2 - 20, padT + chartH - (samples[0] / maxVal) * chartH, 40, (samples[0] / maxVal) * chartH);
      return;
    }

    // Speed line path
    ctx.beginPath();
    const stepX = chartW / (samples.length - 1);

    samples.forEach((val, idx) => {
      const x = padL + idx * stepX;
      const y = padT + chartH - (val / maxVal) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Stroke path
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#0C97E0';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill area below line
    ctx.lineTo(padL + (samples.length - 1) * stepX, padT + chartH);
    ctx.lineTo(padL, padT + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(1, 'rgba(12, 151, 224, 0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Data dots
    samples.forEach((val, idx) => {
      const x = padL + idx * stepX;
      const y = padT + chartH - (val / maxVal) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0C97E0';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [result, bestWpm]);

  // Certificate Renderer
  const renderCertificate = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = (canvas.width = 1400);
    const H = (canvas.height = 1050);

    // Dark cosmic background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#04091a');
    bg.addColorStop(0.5, '#030612');
    bg.addColorStop(1, '#020307');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Glowing cosmic nebulae
    const g1 = ctx.createRadialGradient(250, 200, 50, 250, 200, 500);
    g1.addColorStop(0, 'rgba(12, 151, 224, 0.35)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(1150, 850, 50, 1150, 850, 600);
    g2.addColorStop(0, 'rgba(108, 30, 178, 0.3)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // Outer & Inner Luminous borders (The Frame)
    ctx.strokeStyle = '#0C97E0';
    ctx.lineWidth = 5;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, W - 110, H - 110);

    // Decorative corner brackets on the frame
    const cornerSize = 24;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(55, 55 + cornerSize);
    ctx.lineTo(55, 55);
    ctx.lineTo(55 + cornerSize, 55);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(W - 55 - cornerSize, 55);
    ctx.lineTo(W - 55, 55);
    ctx.lineTo(W - 55, 55 + cornerSize);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(55, H - 55 - cornerSize);
    ctx.lineTo(55, H - 55);
    ctx.lineTo(55 + cornerSize, H - 55);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(W - 55 - cornerSize, H - 55);
    ctx.lineTo(W - 55, H - 55);
    ctx.lineTo(W - 55, H - 55 - cornerSize);
    ctx.stroke();

    // 1. Official Logo on the Top Center
    const logoImg = logoImageRef.current;
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      const logoW = 270;
      const logoH = Math.round(logoW * (logoImg.naturalHeight / logoImg.naturalWidth));
      const logoX = (W - logoW) / 2;
      const logoY = 70;
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    } else {
      // Trigger load if not yet fetched
      const img = new Image();
      img.src = '/assets/aistudio/logo_original.png';
      img.onload = () => {
        logoImageRef.current = img;
        renderCertificate();
      };
      // Fallback text if still loading
      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('TYPE SPRINT', W / 2, 140, 1100);
    }

    // 2. Official Title & Subtitle (strictly aligned inside frame)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.letterSpacing = '5px';
    ctx.fillText('OFFICIAL CERTIFICATE OF TYPING VELOCITY', W / 2, 275, 1100);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 140, 295);
    ctx.lineTo(W / 2 + 140, 295);
    ctx.stroke();

    // 3. Recipient Presentation
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('THIS CERTIFIES THAT', W / 2, 340, 1100);

    // 4. Recipient Name (dynamically fitted to never overflow frame)
    const recipient = certRecipient.trim() || 'Speed Typist';
    let nameSize = 56;
    ctx.font = `bold ${nameSize}px "Plus Jakarta Sans", sans-serif`;
    while (ctx.measureText(recipient).width > 1050 && nameSize > 24) {
      nameSize -= 2;
      ctx.font = `bold ${nameSize}px "Plus Jakarta Sans", sans-serif`;
    }
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '1px';
    ctx.fillText(recipient, W / 2, 410, 1080);

    const measuredNameW = Math.min(1080, ctx.measureText(recipient).width);
    ctx.strokeStyle = 'rgba(12, 151, 224, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - measuredNameW / 2 - 20, 428);
    ctx.lineTo(W / 2 + measuredNameW / 2 + 20, 428);
    ctx.stroke();

    // 5. Verification statement (aligned inside frame)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillText(
      'has demonstrated verified keystroke velocity and neuromuscular accuracy on Type Sprint',
      W / 2,
      468,
      1180
    );

    // 6. Giant Speed Display
    const speedGrad = ctx.createLinearGradient(W / 2 - 140, 0, W / 2 + 140, 0);
    speedGrad.addColorStop(0, '#38bdf8');
    speedGrad.addColorStop(0.5, '#60a5fa');
    speedGrad.addColorStop(1, '#c084fc');
    ctx.fillStyle = speedGrad;
    ctx.font = 'bold 125px "JetBrains Mono", monospace';
    ctx.fillText(String(result.wpm), W / 2, 590, 1100);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('WORDS PER MINUTE', W / 2, 634, 1100);

    // 7. Metric Badges (5 boxes centered inside frame)
    const metrics = [
      ['Accuracy', `${result.accuracy}%`],
      ['Consistency', `${result.consistency}%`],
      ['Total Chars', String(result.correctChars)],
      ['Duration', `${result.timeTaken}s`],
      ['Test Mode', result.mode.toUpperCase()],
    ];

    const boxW = 184;
    const boxH = 90;
    const gap = 20;
    const startX = (W - (metrics.length * boxW + (metrics.length - 1) * gap)) / 2;
    const boxY = 680;

    metrics.forEach(([label, value], i) => {
      const bx = startX + i * (boxW + gap);
      ctx.fillStyle = 'rgba(7, 13, 29, 0.75)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, boxY, boxW, boxH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.letterSpacing = '1px';
      ctx.fillText(label.toUpperCase(), bx + boxW / 2, boxY + 32, boxW - 16);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.letterSpacing = '0px';
      ctx.fillText(value, bx + boxW / 2, boxY + 70, boxW - 16);
    });

    // 8. Stamp / Signature Footer (all inside inner frame bounds)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 280, 825);
    ctx.lineTo(W / 2 + 280, 825);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(`Issued on ${result.date} · Verification Hash: ${result.id}`, W / 2, 865, 1150);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('Verified by Type Sprint AI Neural Diagnostics Engine', W / 2, 900, 1150);
  };

  useEffect(() => {
    if (showShareModal) {
      setTimeout(renderCertificate, 50);
    }
  }, [showShareModal, certRecipient]);

  // Download certificate PNG
  const downloadCertificate = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = `type-sprint-certificate-${result.wpm}wpm.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  // Copy Summary
  const copySummary = () => {
    const text = [
      `🚀 Type Sprint — Typing Speed Test Result`,
      `Velocity: ${result.wpm} WPM`,
      `Accuracy: ${result.accuracy}%`,
      `Consistency: ${result.consistency}%`,
      `Mode: ${result.mode} · Duration: ${result.timeTaken}s`,
      `Can you beat my speed on Type Sprint?`,
    ].join('\n');

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Banner / New PB Tag */}
      {isPb && (
        <div className="flex items-center justify-center gap-2 py-2 px-6 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Award className="w-5 h-5 text-amber-400" />
          <span>NEW ALL-TIME PERSONAL RECORD!</span>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Giant Speed Orb Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-[#07112c]/90 via-[#0a1738]/80 to-[#040817]/90 border border-sky-500/30 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Velocity</span>
              {diffFromAvg !== 0 && (
                <span
                  className={`text-xs font-mono font-semibold flex items-center gap-1 ${
                    diffFromAvg > 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {diffFromAvg > 0 ? `+${diffFromAvg}` : diffFromAvg} WPM vs average
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 dark:from-white dark:via-cyan-200 dark:to-sky-400 bg-clip-text text-transparent drop-shadow-none dark:drop-shadow-[0_0_25px_rgba(56,189,248,0.5)]">
                {result.wpm}
              </span>
              <span className="text-xl font-bold text-slate-600 dark:text-slate-400">WPM</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-sky-500/15 text-xs">
            <div>
              <span className="text-slate-500 block uppercase">Raw Speed</span>
              <span className="text-base font-mono font-bold text-slate-800 dark:text-slate-200">{result.rawWpm} wpm</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase">All-Time Best</span>
              <span className="text-base font-mono font-bold text-amber-500 dark:text-amber-400">{Math.max(bestWpm, result.wpm)} wpm</span>
            </div>
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="p-6 rounded-2xl bg-[#060c1d]/85 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Accuracy</span>
          <div className="my-2">
            <span
              className={`text-5xl font-extrabold font-mono ${
                result.accuracy >= 98
                  ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                  : result.accuracy >= 90
                  ? 'text-cyan-300'
                  : 'text-amber-400'
              }`}
            >
              {result.accuracy}%
            </span>
          </div>
          <div className="text-xs text-slate-400 pt-3 border-t border-sky-500/10">
            <span>{result.correctChars} correct</span> · <span className="text-red-400">{result.errors} errors</span>
          </div>
        </div>

        {/* Consistency Card */}
        <div className="p-6 rounded-2xl bg-[#060c1d]/85 border border-sky-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Consistency</span>
          <div className="my-2">
            <span className="text-5xl font-extrabold font-mono text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              {result.consistency}%
            </span>
          </div>
          <div className="text-xs text-slate-400 pt-3 border-t border-sky-500/10">
            <span>Rhythmic Cadence</span>
          </div>
        </div>
      </div>

      {/* Speed Progression Timeline Chart */}
      <div className="p-6 rounded-2xl bg-[#060c1d]/85 border border-sky-500/20 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs uppercase font-mono tracking-widest text-slate-300">
              Velocity Telemetry Curve (Second-by-Second)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">Duration: {result.timeTaken}s</span>
        </div>
        <canvas ref={chartCanvasRef} className="w-full h-44 block" />
      </div>

      {/* Weak Keys Heatmap Section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 px-1">
          Session Keystroke Diagnostic Heatmap
        </h4>
        <KeyboardVisualizer showHeatmap weakKeysMap={weakKeysMap} />
      </div>

      {/* Realtime Diagnosed Bottleneck Keys Telemetry Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#070f26] to-purple-950/40 border border-red-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-white">
                Diagnosed Bottleneck Keys
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                Live Test Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {bottleneckKeys.length > 0
                ? 'Actual keystrokes triggering errors or latency hesitation in this sprint'
                : 'Zero errors detected — flawless neuromuscular execution across all keys'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {bottleneckKeys.length > 0 ? (
            bottleneckKeys.map((k) => {
              const stat = result.keyStats?.[k] || result.keyStats?.[k.toUpperCase()];
              const errs = stat?.errors || 0;
              const total = stat?.total || 0;
              const errRate = total > 0 ? Math.round((errs / total) * 100) : 0;
              const avgMs = total > 0 && stat?.totalMs ? Math.round(stat.totalMs / total) : null;

              return (
                <div
                  key={k}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 font-mono font-bold text-sm flex items-center gap-2 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                >
                  <span className="text-base text-white font-black">{k.toUpperCase()}</span>
                  <span className="text-[10px] text-red-300 font-normal">
                    {errs > 0 ? `${errs} err (${errRate}%)` : avgMs ? `${avgMs}ms` : 'friction'}
                  </span>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-emerald-400 font-mono font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              100% Precision
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(12,151,224,0.4)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Next Sprint (Tab)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 border border-sky-500/30 text-sky-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Achievement Certificate</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTrainWeakness}
            disabled={isGeneratingDrill}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border border-purple-400/50 text-white font-bold text-sm shadow-[0_0_25px_rgba(168,85,247,0.45)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 text-cyan-200 ${isGeneratingDrill ? 'animate-spin' : ''}`} />
            <span>
              {isGeneratingDrill
                ? 'Synthesizing Drill...'
                : bottleneckKeys.length > 0
                ? `Train Weakness with AI (${bottleneckKeys.map((k) => k.toUpperCase()).join(', ')})`
                : 'Train Weakness with AI'}
            </span>
          </button>

          <button
            type="button"
            onClick={onNavigateToAiCoach}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-xs"
            title="Open AI Biomechanical Coach Lab"
          >
            <span>Full AI Lab</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToAnalytics}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Share / Certificate Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#070e24] border border-sky-500/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sky-500/15">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Award className="w-5 h-5" />
                <span>Certificate of Keystroke Mastery</span>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Recipient Name Customization */}
            <div className="flex items-center gap-3">
              <label htmlFor="cert-name-input" className="text-xs uppercase font-mono text-slate-400 whitespace-nowrap">
                Name on Certificate:
              </label>
              <input
                id="cert-name-input"
                type="text"
                value={certRecipient}
                onChange={(e) => setCertRecipient(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-sky-500/30 text-white font-medium text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Canvas Preview */}
            <div className="rounded-xl overflow-hidden border border-sky-500/20 bg-black">
              <canvas ref={certCanvasRef} className="w-full h-auto block" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={copySummary}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Results Summary'}</span>
              </button>

              <button
                type="button"
                onClick={downloadCertificate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
