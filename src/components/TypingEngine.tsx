import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TestMode, DifficultyLevel, TestResult } from '../types';
import { getRandomWord, endsSentence, quotes, codeSnippets } from '../data/words';
import { sound } from '../utils/sound';
import { AlertCircle, RotateCcw, Volume2, VolumeX, Code, Zap, Target } from 'lucide-react';

interface TypingEngineProps {
  mode: TestMode;
  level: DifficultyLevel;
  duration: number; // in seconds, or word count for word-sprint
  onComplete: (result: TestResult) => void;
  onKeyStroke?: (key: string) => void;
  customText?: string;
  isAiGenerated?: boolean;
}

export const TypingEngine: React.FC<TypingEngineProps> = ({
  mode,
  level,
  duration,
  onComplete,
  onKeyStroke,
  customText,
  isAiGenerated = false,
}) => {
  // Word state
  const [words, setWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [typedHistory, setTypedHistory] = useState<string[][]>([]); // letter states per word
  const [extraChars, setExtraChars] = useState<Record<number, string[]>>({});

  // Test status
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Live Metrics
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);

  // Synchronous Metrics Refs (Guarantees zero stale closures & real-time accuracy)
  const startTimeRef = useRef<number | null>(null);
  const correctCharsRef = useRef(0);
  const totalKeystrokesRef = useRef(0);
  const totalErrorsRef = useRef(0);
  const wordsCompletedRef = useRef(0);
  const lastSecondCharsRef = useRef(0);
  const finishedRef = useRef(false);
  const finishTestRef = useRef<() => void>(() => {});

  // Smooth Caret Coordinate State
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0, height: 32, visible: false, isTyping: false });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Telemetry per second & per key with latency tracking
  const wpmPerSecondRef = useRef<number[]>([]);
  const keyTelemetryRef = useRef<Record<string, { total: number; errors: number; totalMs?: number }>>({});
  const lastKeyTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // DOM Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordsElRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeCharSpanRef = useRef<HTMLSpanElement | null>(null);

  // Focus helper
  const focusInput = () => {
    if (!finished && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Helper to generate a batch of random words
  const generateBatch = useCallback((count = 80, startCapital = true): string[] => {
    const list: string[] = [];
    let needCap = startCapital;
    for (let i = 0; i < count; i++) {
      const w = getRandomWord(level, needCap);
      list.push(w);
      needCap = endsSentence(w);
    }
    return list;
  }, [level]);

  // Dynamic helper to fetch more continuous words for any mode
  const getMoreWords = useCallback((count = 80): string[] => {
    if (customText) {
      const base = customText.trim().split(/\s+/);
      const res: string[] = [];
      while (res.length < count) {
        res.push(...base);
      }
      return res.slice(0, count);
    }

    if (mode === 'quote') {
      const res: string[] = [];
      while (res.length < count) {
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        res.push(...q.text.split(' '));
      }
      return res;
    }

    if (mode === 'code') {
      const snippetGroup = codeSnippets.javascript.concat(codeSnippets.python, codeSnippets.cpp);
      const res: string[] = [];
      while (res.length < count) {
        const chosen = snippetGroup[Math.floor(Math.random() * snippetGroup.length)];
        res.push(...chosen.split(' '));
      }
      return res;
    }

    // Classic / Time-Attack / Precision / Zen / Endless / Word Sprint
    const lastWord = words.length > 0 ? words[words.length - 1] : undefined;
    const needCap = lastWord ? endsSentence(lastWord) : true;
    return generateBatch(count, needCap);
  }, [customText, mode, words, generateBatch]);

  // Generate generous initial words based on mode so box never runs dry
  const generateInitialWords = useCallback(() => {
    if (customText) {
      const base = customText.trim().split(/\s+/);
      if (base.length >= 120) return base;
      const repeated: string[] = [];
      while (repeated.length < 150) {
        repeated.push(...base);
      }
      return repeated;
    }

    if (mode === 'quote') {
      // Chain 5-6 quotes together for a long continuous stream
      const list: string[] = [];
      for (let i = 0; i < 6; i++) {
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        list.push(...q.text.split(' '));
      }
      return list;
    }

    if (mode === 'code') {
      // Chain 5 code snippets together
      const snippetGroup = codeSnippets.javascript.concat(codeSnippets.python, codeSnippets.cpp);
      const list: string[] = [];
      for (let i = 0; i < 5; i++) {
        const chosen = snippetGroup[Math.floor(Math.random() * snippetGroup.length)];
        list.push(...chosen.split(' '));
      }
      return list;
    }

    // Classic / Time-Attack / Precision / Zen / Endless / Word Sprint
    const count = mode === 'word-sprint' ? Math.max(duration + 60, 150) : 220;
    return generateBatch(count, true);
  }, [customText, mode, duration, generateBatch]);

  // Reset engine
  const resetTest = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    startTimeRef.current = null;
    finishedRef.current = false;
    correctCharsRef.current = 0;
    totalKeystrokesRef.current = 0;
    totalErrorsRef.current = 0;
    wordsCompletedRef.current = 0;
    lastSecondCharsRef.current = 0;
    wpmPerSecondRef.current = [];
    keyTelemetryRef.current = {};
    lastKeyTimeRef.current = 0;

    const newWords = generateInitialWords();
    setWords(newWords);
    setWordIndex(0);
    setCharIndex(0);
    setTypedHistory(newWords.map((w) => new Array(w.length).fill('')));
    setExtraChars({});

    setStarted(false);
    setFinished(false);
    setTimeLeft(mode === 'word-sprint' ? 0 : duration);

    setLiveWpm(0);
    setLiveAccuracy(100);
    setCorrectChars(0);
    setErrors(0);
    setTotalEntries(0);
    setWordsCompleted(0);

    if (wordsElRef.current) {
      wordsElRef.current.style.transform = 'translateY(0px)';
    }

    setTimeout(() => {
      focusInput();
    }, 60);
  }, [generateInitialWords, mode, duration]);

  // Initial mount and parameter change reset
  useEffect(() => {
    resetTest();
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetTest]);

  // Continuous Word Stream Replenishment
  const ensureWordSupply = useCallback(() => {
    // When within 35 words of the end (or box is low), automatically generate and append more!
    if (wordIndex >= words.length - 35) {
      const extra = getMoreWords(80);
      setWords((prev) => [...prev, ...extra]);
      setTypedHistory((prev) => [...prev, ...extra.map((w) => new Array(w.length).fill(''))]);
    }
  }, [wordIndex, words.length, getMoreWords]);

  // Call ensureWordSupply when wordIndex changes
  useEffect(() => {
    ensureWordSupply();
  }, [wordIndex, ensureWordSupply]);

  // Helper: core character / space / backspace processors (used by both KeyDown & mobile soft keyboard)
  const handleSpacePress = useCallback(() => {
    if (finishedRef.current || charIndex === 0) return;

    totalKeystrokesRef.current += 1;
    const currentWord = words[wordIndex] || '';
    const currentWordHistory = typedHistory[wordIndex] || [];
    const hasErrors =
      currentWordHistory.some((s) => s === 'incorrect') ||
      (extraChars[wordIndex] && extraChars[wordIndex].length > 0) ||
      charIndex < currentWord.length;

    if (!hasErrors) {
      correctCharsRef.current += 1;
    } else {
      totalErrorsRef.current += 1;
    }

    wordsCompletedRef.current += 1;
    setWordsCompleted(wordsCompletedRef.current);
    sound.space();

    if (mode === 'word-sprint' && wordsCompletedRef.current >= duration) {
      finishTestRef.current();
      return;
    }

    const nextWordIdx = wordIndex + 1;
    if (nextWordIdx >= words.length - 20) {
      const extra = getMoreWords(80);
      setWords((prev) => [...prev, ...extra]);
      setTypedHistory((prev) => [...prev, ...extra.map((w) => new Array(w.length).fill(''))]);
    }

    setWordIndex(nextWordIdx);
    setCharIndex(0);
  }, [charIndex, words, wordIndex, typedHistory, extraChars, mode, duration, getMoreWords]);

  // Smooth Line Scrolling & Caret Position Calculator (adapts dynamically to any font size / resize / orientation)
  const syncCaretAndScroll = useCallback(
    (markTyping = false) => {
      if (!wordsElRef.current || !containerRef.current) return;

      const wordsContainer = wordsElRef.current;
      const scrollContainer = containerRef.current;
      const currentWordEl = wordsContainer.children[wordIndex] as HTMLElement | undefined;

      if (!currentWordEl) return;

      // Measure actual rendered row spacing dynamically from DOM children
      const firstWordEl = wordsContainer.children[0] as HTMLElement | undefined;
      const firstWordTop = firstWordEl?.offsetTop || 0;
      let lineStep = (currentWordEl.offsetHeight || 48) + 12;
      for (let i = 1; i < wordsContainer.children.length; i++) {
        const childTop = (wordsContainer.children[i] as HTMLElement).offsetTop;
        if (childTop > firstWordTop + 4) {
          lineStep = childTop - firstWordTop;
          break;
        }
      }

      const wordTop = currentWordEl.offsetTop;
      const currentLine = Math.max(0, Math.round((wordTop - firstWordTop) / Math.max(1, lineStep)));

      if (currentLine >= 2) {
        const shiftY = (currentLine - 1) * lineStep;
        wordsContainer.style.transform = `translateY(-${shiftY}px)`;
      } else {
        wordsContainer.style.transform = 'translateY(0px)';
      }

      const containerRect = scrollContainer.getBoundingClientRect();
      let targetLeft = 0;
      let targetTop = 0;
      let targetHeight = currentWordEl.offsetHeight || 36;

      if (activeCharSpanRef.current) {
        const charRect = activeCharSpanRef.current.getBoundingClientRect();
        targetLeft = charRect.left - containerRect.left;
        targetTop = charRect.top - containerRect.top;
        targetHeight = charRect.height || targetHeight;
      } else {
        const letters = currentWordEl.querySelectorAll('.letter-span');
        if (letters.length > 0) {
          const lastCharRect = letters[letters.length - 1].getBoundingClientRect();
          targetLeft = lastCharRect.right - containerRect.left + 2;
          targetTop = lastCharRect.top - containerRect.top;
          targetHeight = lastCharRect.height || targetHeight;
        } else {
          const wordRect = currentWordEl.getBoundingClientRect();
          targetLeft = wordRect.left - containerRect.left;
          targetTop = wordRect.top - containerRect.top;
          targetHeight = wordRect.height || targetHeight;
        }
      }

      setCaretPos((prev) => ({
        left: Math.round(targetLeft),
        top: Math.round(targetTop),
        height: Math.round(targetHeight),
        visible: true,
        isTyping: markTyping ? true : prev.isTyping,
      }));
    },
    [wordIndex]
  );

  useEffect(() => {
    syncCaretAndScroll(true);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setCaretPos((prev) => ({ ...prev, isTyping: false }));
    }, 600);
  }, [wordIndex, charIndex, words, syncCaretAndScroll]);

  // Recalculate caret & line offsets cleanly on resize or phone orientation change
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => syncCaretAndScroll(false);
    window.addEventListener('resize', handleResize);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    observer?.observe(el);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [syncCaretAndScroll]);

  // Synchronous metric updater: calculates live Net WPM and Accuracy
  const updateLiveMetrics = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsedSec = Math.max(0.5, (Date.now() - startTimeRef.current) / 1000);
    const elapsedMin = elapsedSec / 60;

    const correct = correctCharsRef.current;
    const totalKeys = totalKeystrokesRef.current;
    const errorsCount = totalErrorsRef.current;

    // International Standard Net WPM: (correct characters / 5) / minutes
    const currentWpm = Math.max(0, Math.round((correct / 5) / elapsedMin));

    // Standard Accuracy: (total keystrokes - total errors) / total keystrokes
    const currentAcc = totalKeys > 0
      ? Math.max(0, Math.min(100, Math.round(((totalKeys - errorsCount) / totalKeys) * 100)))
      : 100;

    setLiveWpm(currentWpm);
    setLiveAccuracy(currentAcc);
    setCorrectChars(correct);
    setErrors(errorsCount);
    setTotalEntries(totalKeys);
    setWordsCompleted(wordsCompletedRef.current);
  }, []);

  // Finish test and calculate analytics directly from master refs
  const finishTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const startTime = startTimeRef.current || Date.now();
    const totalTimeSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const totalTimeMin = totalTimeSec / 60;

    const correct = correctCharsRef.current;
    const totalKeys = totalKeystrokesRef.current;
    const totalErr = totalErrorsRef.current;
    const completedWords = wordsCompletedRef.current;

    // Net WPM (International Typing Standard: correct characters / 5 / minutes)
    const finalWpm = Math.max(0, Math.round((correct / 5) / totalTimeMin));

    // Raw WPM (Gross Keystrokes / 5 / minutes)
    const rawWpm = Math.max(0, Math.round((totalKeys / 5) / totalTimeMin));

    // Accuracy %: (total keystrokes - total errors) / total keystrokes
    const acc = totalKeys > 0
      ? Math.max(0, Math.min(100, Math.round(((totalKeys - totalErr) / totalKeys) * 100)))
      : 100;

    // Consistency (Monkeytype standard: 100 * (1 - Coefficient of Variation))
    const samples = wpmPerSecondRef.current.length > 0 ? wpmPerSecondRef.current : [finalWpm];
    let consistency = 100;
    if (samples.length > 1) {
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      if (mean > 0) {
        const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;
        consistency = Math.max(0, Math.min(100, Math.round(100 * (1 - cv))));
      }
    }

    sound.finish();

    const result: TestResult = {
      id: 'res_' + Date.now().toString(36),
      wpm: finalWpm,
      rawWpm,
      accuracy: acc,
      consistency,
      correctChars: correct,
      incorrectChars: totalErr,
      errors: totalErr,
      totalEntries: totalKeys,
      wordsCompleted: completedWords,
      timeTaken: totalTimeSec,
      targetDuration: duration,
      mode,
      level,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      wpmPerSecond: samples,
      keyStats: keyTelemetryRef.current,
    };

    onComplete(result);
  }, [duration, mode, level, onComplete]);

  // Keep finishTestRef in sync
  useEffect(() => {
    finishTestRef.current = finishTest;
  }, [finishTest]);

  // Timer runner
  const startTimer = useCallback(() => {
    if (startTimeRef.current) return;
    startTimeRef.current = Date.now();
    setStarted(true);

    const isSprint = mode === 'word-sprint';
    lastSecondCharsRef.current = 0;

    timerIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current || finishedRef.current) return;

      const elapsedSec = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));

      // Instantaneous WPM for this 1-second slice
      const charsNow = correctCharsRef.current;
      const charsDelta = Math.max(0, charsNow - lastSecondCharsRef.current);
      lastSecondCharsRef.current = charsNow;
      const instWpm = charsDelta * 12; // (chars / 5) * 60
      wpmPerSecondRef.current.push(instWpm);

      if (isSprint) {
        setTimeLeft(elapsedSec);
      } else {
        const remaining = duration - elapsedSec;
        setTimeLeft(Math.max(0, remaining));

        if (remaining <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          finishTestRef.current();
          return;
        }
      }

      updateLiveMetrics();
    }, 1000);
  }, [duration, mode, updateLiveMetrics]);

  // Keypress input handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }

    // Restart key triggers
    if (e.key === 'Tab' || (e.key === 'Escape' && !finished)) {
      e.preventDefault();
      resetTest();
      return;
    }

    if (finishedRef.current) return;

    if (onKeyStroke) {
      onKeyStroke(e.key);
    }

    // Ignore modifier combinations
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (!startTimeRef.current && e.key.length === 1) {
      startTimer();
    }

    // Space key moves to next word
    if (e.key === ' ') {
      e.preventDefault();
      handleSpacePress();
      updateLiveMetrics();
      return;
    }

    // Backspace handling
    if (e.key === 'Backspace') {
      e.preventDefault();
      lastKeyDownBackspaceTsRef.current = Date.now();
      performBackspace();
      return;
    }

    // Regular single character typing
    if (e.key.length === 1) {
      e.preventDefault();
      totalKeystrokesRef.current += 1;

      const currentWord = words[wordIndex] || '';
      const targetChar = currentWord[charIndex];
      const typedChar = e.key;

      const now = Date.now();
      const deltaMs = lastKeyTimeRef.current > 0 ? Math.min(2000, now - lastKeyTimeRef.current) : 0;
      lastKeyTimeRef.current = now;

      if (charIndex < currentWord.length) {
        const isMatch = typedChar === targetChar;
        const targetLower = targetChar.toLowerCase();

        if (!keyTelemetryRef.current[targetLower]) {
          keyTelemetryRef.current[targetLower] = { total: 0, errors: 0, totalMs: 0 };
        }
        keyTelemetryRef.current[targetLower].total += 1;
        if (deltaMs > 0) {
          keyTelemetryRef.current[targetLower].totalMs = (keyTelemetryRef.current[targetLower].totalMs || 0) + deltaMs;
        }

        if (isMatch) {
          sound.correct();
          correctCharsRef.current += 1;
        } else {
          sound.error();
          totalErrorsRef.current += 1;
          keyTelemetryRef.current[targetLower].errors += 1;

          const typedLower = typedChar.toLowerCase();
          if (typedLower !== targetLower) {
            if (!keyTelemetryRef.current[typedLower]) {
              keyTelemetryRef.current[typedLower] = { total: 0, errors: 0, totalMs: 0 };
            }
            keyTelemetryRef.current[typedLower].total += 1;
            keyTelemetryRef.current[typedLower].errors += 1;
          }

          if (mode === 'endless' && totalErrorsRef.current >= 3) {
            finishTestRef.current();
            return;
          }
        }

        setTypedHistory((prev) => {
          const copy = [...prev];
          if (copy[wordIndex]) {
            copy[wordIndex] = [...copy[wordIndex]];
            copy[wordIndex][charIndex] = isMatch ? 'correct' : 'incorrect';
          }
          return copy;
        });
        setCharIndex((prev) => prev + 1);
      } else {
        sound.error();
        totalErrorsRef.current += 1;
        const typedLower = typedChar.toLowerCase();
        if (!keyTelemetryRef.current[typedLower]) {
          keyTelemetryRef.current[typedLower] = { total: 0, errors: 0, totalMs: 0 };
        }
        keyTelemetryRef.current[typedLower].total += 1;
        keyTelemetryRef.current[typedLower].errors += 1;

        setExtraChars((prev) => ({
          ...prev,
          [wordIndex]: [...(prev[wordIndex] || []), typedChar],
        }));
        setCharIndex((prev) => prev + 1);
      }

      updateLiveMetrics();
    }
  };

  const lastKeyDownBackspaceTsRef = useRef<number>(0);

  const performBackspace = useCallback(() => {
    if (finishedRef.current) return;
    if (charIndex > 0) {
      totalKeystrokesRef.current += 1;

      const currentWord = words[wordIndex] || '';
      const currentExtras = extraChars[wordIndex] || [];

      if (charIndex > currentWord.length && currentExtras.length > 0) {
        setExtraChars((prev) => ({
          ...prev,
          [wordIndex]: prev[wordIndex].slice(0, -1),
        }));
        setCharIndex((prev) => prev - 1);
      } else {
        const prevIdx = charIndex - 1;
        const status = typedHistory[wordIndex]?.[prevIdx];

        if (status === 'correct') {
          correctCharsRef.current = Math.max(0, correctCharsRef.current - 1);
        }

        setTypedHistory((prev) => {
          const copy = [...prev];
          if (copy[wordIndex]) {
            copy[wordIndex] = [...copy[wordIndex]];
            copy[wordIndex][prevIdx] = '';
          }
          return copy;
        });
        setCharIndex(prevIdx);
      }

      updateLiveMetrics();
    } else if (wordIndex > 0) {
      const prevWordIdx = wordIndex - 1;
      const prevWord = words[prevWordIdx] || '';
      setWordIndex(prevWordIdx);
      setCharIndex(prevWord.length);
      wordsCompletedRef.current = Math.max(0, wordsCompletedRef.current - 1);
      setWordsCompleted(wordsCompletedRef.current);
      updateLiveMetrics();
    }
  }, [charIndex, words, wordIndex, extraChars, typedHistory, updateLiveMetrics]);

  // Fallback input handler for Android / mobile IME soft keyboards that emit e.key === 'Unidentified'
  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    e.target.value = '';
    if (!val || finishedRef.current) return;

    for (const ch of val) {
      if (!startTimeRef.current) {
        startTimer();
      }
      if (onKeyStroke) {
        onKeyStroke(ch);
      }
      if (ch === ' ') {
        handleSpacePress();
        break;
      }

      totalKeystrokesRef.current += 1;
      const currentWord = words[wordIndex] || '';
      const targetChar = currentWord[charIndex];
      if (charIndex < currentWord.length) {
        const isMatch = ch === targetChar;
        const targetLower = targetChar.toLowerCase();
        if (!keyTelemetryRef.current[targetLower]) {
          keyTelemetryRef.current[targetLower] = { total: 0, errors: 0, totalMs: 0 };
        }
        keyTelemetryRef.current[targetLower].total += 1;

        if (isMatch) {
          sound.correct();
          correctCharsRef.current += 1;
        } else {
          sound.error();
          totalErrorsRef.current += 1;
          keyTelemetryRef.current[targetLower].errors += 1;
          if (mode === 'endless' && totalErrorsRef.current >= 3) {
            finishTestRef.current();
            return;
          }
        }

        setTypedHistory((prev) => {
          const copy = [...prev];
          if (copy[wordIndex]) {
            copy[wordIndex] = [...copy[wordIndex]];
            copy[wordIndex][charIndex] = isMatch ? 'correct' : 'incorrect';
          }
          return copy;
        });
        setCharIndex((prev) => prev + 1);
      }
    }

    updateLiveMetrics();
  };

  return (
    <div
      className="w-full flex flex-col items-center select-none relative"
      onClick={focusInput}
    >
      {/* Caps Lock Warning Banner */}
      {capsLockOn && (
        <div className="flex items-center gap-2 mb-3 px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-semibold animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>CAPS LOCK IS ACTIVE</span>
        </div>
      )}

      {/* Top HUD Telemetry Ribbon (Adapts from stacked mobile 3-col strip to single-row desktop bar) */}
      <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2.5 gap-x-2 sm:gap-x-4 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-4 mb-3 sm:mb-4 rounded-2xl bg-[#060c1d]/90 border border-sky-500/20 backdrop-blur-md shadow-lg text-sm sm:text-base">
        {/* Left: Mode & Level Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <span className="font-bold text-sky-400 capitalize flex items-center gap-1.5 sm:gap-2 text-xs sm:text-lg whitespace-nowrap">
            {mode === 'code' && <Code className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />}
            {mode === 'precision' && <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />}
            {mode === 'time-attack' && <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />}
            {mode.replace('-', ' ')}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 uppercase tracking-wider text-[11px] sm:text-sm font-mono font-bold whitespace-nowrap">{level}</span>
          {isAiGenerated && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 whitespace-nowrap">
              AI Tailored
            </span>
          )}
        </div>

        {/* Right Quick Controls (stays on top row beside Mode on mobile, moves to right on md+) */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:order-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.enabled = !sound.enabled;
              focusInput();
            }}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={sound.enabled ? 'Mute Sounds' : 'Unmute Sounds'}
            aria-label="Toggle Sound"
          >
            {sound.enabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetTest();
            }}
            className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 hover:text-white transition whitespace-nowrap"
            title="Restart Test (Tab / Esc)"
            aria-label="Restart Test"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Restart</span>
          </button>
        </div>

        {/* Center: Live Speed & Accuracy & Time */}
        <div className="w-full md:w-auto md:order-2 grid grid-cols-3 md:flex items-center gap-2 sm:gap-6 lg:gap-8 font-mono pt-2 md:pt-0 border-t md:border-t-0 border-sky-500/10 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center md:justify-start gap-0 sm:gap-2">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Speed</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-sky-300 tabular-nums">{liveWpm}</span>
              <span className="text-[10px] sm:text-xs text-slate-400">wpm</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center md:justify-start gap-0 sm:gap-2">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Acc</span>
            <span
              className={`text-lg sm:text-xl lg:text-2xl font-black tabular-nums ${
                liveAccuracy >= 95 ? 'text-emerald-400' : liveAccuracy >= 85 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {liveAccuracy}%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center md:justify-end gap-0 sm:gap-2 md:min-w-[85px]">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">
              {mode === 'word-sprint' ? 'Words' : 'Time'}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black text-cyan-400 tabular-nums">
                {mode === 'word-sprint' ? `${wordsCompleted}/${duration}` : timeLeft}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">{mode === 'word-sprint' ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline Bar */}
      {mode !== 'word-sprint' && (
        <div className="w-full h-1.5 mb-3 sm:mb-4 bg-slate-900/80 rounded-full overflow-hidden border border-sky-500/15">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(0, (timeLeft / duration) * 100)}%` }}
          />
        </div>
      )}

      {/* Main Words Flow Box (fluid padding & adaptive 3-line height across mobile, laptop height, desktop) */}
      <div
        onClick={focusInput}
        className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 lg:p-11 bg-[#040817]/90 border border-sky-500/30 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(56,189,248,0.15)] relative cursor-text transition-all duration-200 hover:border-cyan-400/50"
      >
        {/* Hidden input placed inside the typing box so mobile browsers don't jump scroll to top */}
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          enterKeyHint="done"
          className="opacity-0 pointer-events-none absolute top-4 left-4 w-1 h-1"
          onKeyDown={handleKeyDown}
          onBeforeInput={(e) => {
            const inputEvent = e.nativeEvent as InputEvent;
            if (inputEvent?.inputType === 'deleteContentBackward' && Date.now() - lastKeyDownBackspaceTsRef.current > 50) {
              performBackspace();
            }
          }}
          onChange={handleMobileInputChange}
          onKeyUp={(e) => setCapsLockOn(e.getModifierState?.('CapsLock') || false)}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Keystroke Capture"
        />

        {/* Inner 3-line clipping viewport */}
        <div
          ref={containerRef}
          className="w-full h-[132px] sm:h-[164px] md:h-[186px] lg:h-[208px] overflow-hidden relative"
        >
          {/* Animated Smooth Gliding Cosmic Caret with Glowing Orb Head */}
          {caretPos.visible && (
            <div
              className={`absolute w-[3px] sm:w-[4px] rounded-full pointer-events-none transition-[left,top] duration-100 ease-out z-20 ${
                caretPos.isTyping
                  ? 'bg-cyan-300 shadow-[0_0_16px_#38bdf8,0_0_32px_rgba(12,151,224,0.9)] opacity-100'
                  : 'bg-gradient-to-b from-cyan-300 via-sky-400 to-indigo-400 animate-caret'
              }`}
              style={{
                left: `${caretPos.left}px`,
                top: `${caretPos.top}px`,
                height: `${caretPos.height}px`,
              }}
            >
              {/* Luminous orbital bead on cursor head */}
              <div className="absolute -top-1 -left-[3px] w-2.5 h-2.5 rounded-full bg-cyan-300 blur-[1px] opacity-80" />
            </div>
          )}

          {/* Text Container with Smooth Upward Shift */}
          <div
            ref={wordsElRef}
            className="flex flex-wrap gap-x-3 sm:gap-x-4 md:gap-x-5 gap-y-2.5 sm:gap-y-3.5 md:gap-y-4 font-mono text-xl sm:text-2xl md:text-[30px] lg:text-[34px] xl:text-[36px] leading-[1.6] tracking-wide transition-transform duration-250 ease-out will-change-transform"
          >
            {words.map((word, wIdx) => {
              const isCurrentWord = wIdx === wordIndex;
              const isPastWord = wIdx < wordIndex;
              const letters = word.split('');
              const wordHistory = typedHistory[wIdx] || [];
              const extras = extraChars[wIdx] || [];

              return (
                <div
                  key={wIdx}
                  className={`inline-flex items-center transition-opacity duration-150 ${
                    isPastWord ? 'opacity-35' : 'opacity-100'
                  }`}
                >
                  {letters.map((char, cIdx) => {
                    const status = wordHistory[cIdx];
                    const isCurrentLetter = isCurrentWord && cIdx === charIndex;

                    let textColor = 'text-slate-500';
                    if (status === 'correct') {
                      textColor = 'text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] font-medium';
                    } else if (status === 'incorrect') {
                      textColor = 'text-red-400 bg-red-500/20 rounded font-medium';
                    } else if (isCurrentLetter) {
                      textColor = 'text-cyan-300 font-semibold';
                    }

                    return (
                      <span
                        key={cIdx}
                        ref={isCurrentLetter ? activeCharSpanRef : null}
                        className={`letter-span relative inline-block transition-colors duration-75 ${textColor}`}
                      >
                        {char}
                      </span>
                    );
                  })}

                  {/* Extra typed characters */}
                  {extras.map((extraChar, eIdx) => (
                    <span
                      key={`ext-${eIdx}`}
                      className="text-red-400 bg-red-500/30 rounded px-0.5 underline text-opacity-90 font-medium"
                    >
                      {extraChar}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500 mt-3 sm:mt-4 px-1 sm:px-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <kbd className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 font-mono text-[10px] sm:text-[11px] text-slate-300">
            Tab
          </kbd>
          <span>or</span>
          <kbd className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 font-mono text-[10px] sm:text-[11px] text-slate-300">
            Esc
          </kbd>
          <span>to restart</span>
        </div>
        <div>
          <span>Tap or click box to focus typing</span>
        </div>
      </div>
    </div>
  );
};
