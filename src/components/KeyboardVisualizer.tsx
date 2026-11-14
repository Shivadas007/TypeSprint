import React from 'react';
import { KeyHeatmapInfo } from '../types';

interface KeyboardVisualizerProps {
  activeKey?: string | null;
  weakKeysMap?: Record<string, KeyHeatmapInfo>;
  showHeatmap?: boolean;
  className?: string;
}

interface KeyConfig {
  key: string;
  display?: string;
  mobileDisplay?: string;
  units: number; // Relative ANSI width units (every row totals 15u for full-width edge-to-edge alignment)
  hand: 'left' | 'right' | 'thumb';
  zone: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 1 (Number row: 13*1 + 2 = 15u)
  [
    { key: '`', units: 1, hand: 'left', zone: 'pinky' },
    { key: '1', units: 1, hand: 'left', zone: 'pinky' },
    { key: '2', units: 1, hand: 'left', zone: 'ring' },
    { key: '3', units: 1, hand: 'left', zone: 'middle' },
    { key: '4', units: 1, hand: 'left', zone: 'index' },
    { key: '5', units: 1, hand: 'left', zone: 'index' },
    { key: '6', units: 1, hand: 'right', zone: 'index' },
    { key: '7', units: 1, hand: 'right', zone: 'index' },
    { key: '8', units: 1, hand: 'right', zone: 'middle' },
    { key: '9', units: 1, hand: 'right', zone: 'ring' },
    { key: '0', units: 1, hand: 'right', zone: 'pinky' },
    { key: '-', units: 1, hand: 'right', zone: 'pinky' },
    { key: '=', units: 1, hand: 'right', zone: 'pinky' },
    { key: 'Backspace', display: '⌫ Backspace', mobileDisplay: '⌫', units: 2, hand: 'right', zone: 'pinky' },
  ],
  // Row 2 (Tab / QWERTY: 1.5 + 12*1 + 1.5 = 15u)
  [
    { key: 'Tab', display: 'Tab ⇥', mobileDisplay: 'Tab', units: 1.5, hand: 'left', zone: 'pinky' },
    { key: 'q', units: 1, hand: 'left', zone: 'pinky' },
    { key: 'w', units: 1, hand: 'left', zone: 'ring' },
    { key: 'e', units: 1, hand: 'left', zone: 'middle' },
    { key: 'r', units: 1, hand: 'left', zone: 'index' },
    { key: 't', units: 1, hand: 'left', zone: 'index' },
    { key: 'y', units: 1, hand: 'right', zone: 'index' },
    { key: 'u', units: 1, hand: 'right', zone: 'index' },
    { key: 'i', units: 1, hand: 'right', zone: 'middle' },
    { key: 'o', units: 1, hand: 'right', zone: 'ring' },
    { key: 'p', units: 1, hand: 'right', zone: 'pinky' },
    { key: '[', units: 1, hand: 'right', zone: 'pinky' },
    { key: ']', units: 1, hand: 'right', zone: 'pinky' },
    { key: '\\', units: 1.5, hand: 'right', zone: 'pinky' },
  ],
  // Row 3 (Home row: ASDF JKL;: 1.75 + 11*1 + 2.25 = 15u)
  [
    { key: 'Caps', display: 'Caps Lock', mobileDisplay: 'Caps', units: 1.75, hand: 'left', zone: 'pinky' },
    { key: 'a', units: 1, hand: 'left', zone: 'pinky' },
    { key: 's', units: 1, hand: 'left', zone: 'ring' },
    { key: 'd', units: 1, hand: 'left', zone: 'middle' },
    { key: 'f', units: 1, hand: 'left', zone: 'index' },
    { key: 'g', units: 1, hand: 'left', zone: 'index' },
    { key: 'h', units: 1, hand: 'right', zone: 'index' },
    { key: 'j', units: 1, hand: 'right', zone: 'index' },
    { key: 'k', units: 1, hand: 'right', zone: 'middle' },
    { key: 'l', units: 1, hand: 'right', zone: 'ring' },
    { key: ';', units: 1, hand: 'right', zone: 'pinky' },
    { key: "'", units: 1, hand: 'right', zone: 'pinky' },
    { key: 'Enter', display: '↵ Enter', mobileDisplay: '↵', units: 2.25, hand: 'right', zone: 'pinky' },
  ],
  // Row 4 (Shift / ZXCV BNM: 2.25 + 10*1 + 2.75 = 15u)
  [
    { key: 'Shift', display: '⇧ Shift', mobileDisplay: '⇧', units: 2.25, hand: 'left', zone: 'pinky' },
    { key: 'z', units: 1, hand: 'left', zone: 'pinky' },
    { key: 'x', units: 1, hand: 'left', zone: 'ring' },
    { key: 'c', units: 1, hand: 'left', zone: 'middle' },
    { key: 'v', units: 1, hand: 'left', zone: 'index' },
    { key: 'b', units: 1, hand: 'left', zone: 'index' },
    { key: 'n', units: 1, hand: 'right', zone: 'index' },
    { key: 'm', units: 1, hand: 'right', zone: 'index' },
    { key: ',', units: 1, hand: 'right', zone: 'middle' },
    { key: '.', units: 1, hand: 'right', zone: 'ring' },
    { key: '/', units: 1, hand: 'right', zone: 'pinky' },
    { key: 'ShiftRight', display: '⇧ Shift', mobileDisplay: '⇧', units: 2.75, hand: 'right', zone: 'pinky' },
  ],
  // Row 5 (Space bar row: 1.5 + 1.5 + 9 + 1.5 + 1.5 = 15u)
  [
    { key: 'Ctrl', display: 'Ctrl', units: 1.5, hand: 'left', zone: 'pinky' },
    { key: 'Alt', display: 'Alt', units: 1.5, hand: 'left', zone: 'thumb' },
    { key: ' ', display: 'Space Flow', mobileDisplay: 'Space', units: 9, hand: 'thumb', zone: 'thumb' },
    { key: 'AltRight', display: 'Alt', units: 1.5, hand: 'right', zone: 'thumb' },
    { key: 'CtrlRight', display: 'Ctrl', units: 1.5, hand: 'right', zone: 'pinky' },
  ],
];

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({
  activeKey,
  weakKeysMap = {},
  showHeatmap = false,
  className = '',
}) => {
  const normalizedActiveKey = activeKey?.toLowerCase();

  const getHeatmapColor = (keyChar: string) => {
    const k = keyChar.toLowerCase();
    const stat = weakKeysMap[k];
    if (!stat || stat.totalTyped === 0) {
      return 'bg-slate-900/60 border-slate-800 text-slate-400';
    }

    const rate = stat.errorRate;
    if (rate > 0.25) {
      return 'bg-red-500/25 border-red-500/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
    }
    if (rate > 0.1) {
      return 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    }
    return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]';
  };

  const getFingerZoneColor = (zone: KeyConfig['zone']) => {
    switch (zone) {
      case 'pinky':
        return 'border-purple-500/25 hover:border-purple-500/50';
      case 'ring':
        return 'border-blue-500/25 hover:border-blue-500/50';
      case 'middle':
        return 'border-cyan-500/25 hover:border-cyan-500/50';
      case 'index':
        return 'border-teal-500/25 hover:border-teal-500/50';
      case 'thumb':
        return 'border-sky-500/30 hover:border-sky-500/60';
    }
  };

  return (
    <div
      className={`w-full p-3 sm:p-5 lg:p-7 rounded-2xl sm:rounded-3xl bg-[#060c1c]/85 border border-sky-500/20 backdrop-blur-md shadow-2xl ${className}`}
      role="region"
      aria-label="Full-Sized Interactive Finger Zone Keyboard Visualizer"
    >
      {/* Legend & Stats banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-sky-500/15 text-[11px] sm:text-xs lg:text-sm font-semibold">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-300">
          <span className="font-bold uppercase tracking-wider text-sky-400">Finger Zones</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-400" /> Pinky</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-400" /> Ring</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400" /> Middle</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-teal-400" /> Index</span>
        </div>

        {showHeatmap && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-300">
            <span className="font-bold uppercase tracking-wider text-cyan-400">Accuracy Heatmap:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-emerald-500/70" /> &gt;90%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-amber-500/70" /> 75-90%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500/80" /> &lt;75%</span>
          </div>
        )}
      </div>

      {/* Edge-to-Edge ANSI Keyboard Grid (scales cleanly on every phone 320px+ up to desktop) */}
      <div className="w-full min-w-0">
        <div className="w-full flex flex-col gap-1 sm:gap-2 lg:gap-2.5 select-none">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="w-full flex items-stretch gap-[2px] sm:gap-1.5 lg:gap-2">
              {row.map((item, kIdx) => {
                const isPressed =
                  normalizedActiveKey === item.key.toLowerCase() ||
                  (item.key === ' ' && normalizedActiveKey === ' ') ||
                  (item.key === 'Backspace' && normalizedActiveKey === 'backspace');

                const heatmapClass = showHeatmap ? getHeatmapColor(item.key) : '';
                const zoneBorder = getFingerZoneColor(item.zone);
                const isModifier = item.units > 1;
                const desktopLabel = item.display || item.key.toUpperCase();
                const mobileLabel = item.mobileDisplay || desktopLabel;

                return (
                  <div
                    key={kIdx}
                    style={{ flex: `${item.units} 1 0%` }}
                    className={`
                      min-w-0 h-8 sm:h-11 md:h-14 lg:h-[64px] px-[2px] sm:px-1.5 rounded-md sm:rounded-xl flex flex-col items-center justify-center font-mono transition-all duration-100
                      ${isModifier ? 'text-[8px] sm:text-xs md:text-sm font-semibold' : 'text-[10px] sm:text-base md:text-lg lg:text-xl font-bold'}
                      ${isPressed
                        ? 'bg-gradient-to-b from-cyan-400 to-blue-600 text-black shadow-[0_0_20px_#38bdf8] scale-95 border border-white'
                        : showHeatmap
                        ? `${heatmapClass} border`
                        : `bg-[#09132b]/80 text-slate-200 border ${zoneBorder} shadow-sm`
                      }
                    `}
                  >
                    {mobileLabel !== desktopLabel ? (
                      <>
                        <span className="sm:hidden truncate max-w-full">{mobileLabel}</span>
                        <span className="hidden sm:inline truncate max-w-full">{desktopLabel}</span>
                      </>
                    ) : (
                      <span className="truncate max-w-full">{desktopLabel}</span>
                    )}
                    {showHeatmap && weakKeysMap[item.key.toLowerCase()]?.totalTyped > 0 && (
                      <span className="text-[7px] sm:text-[10px] tabular-nums opacity-90 mt-0.5 leading-none">
                        {Math.round((1 - weakKeysMap[item.key.toLowerCase()].errorRate) * 100)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
