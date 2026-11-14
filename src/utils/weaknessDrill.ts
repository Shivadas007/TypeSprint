// Real-time Bottleneck Key Detection & High-Density Error Correction Drill Generator

export interface KeyTelemetryData {
  total: number;
  errors: number;
  totalMs?: number;
}

/**
 * Extracts real-time bottleneck keys from a session's actual keystroke telemetry.
 * Prioritizes keys with actual errors, followed by transition latency (slowest keys).
 * NEVER falls back to static dummy keys if session keystrokes exist.
 */
export function extractBottleneckKeys(
  keyStats?: Record<string, KeyTelemetryData>,
  limit = 5
): string[] {
  if (!keyStats || Object.keys(keyStats).length === 0) {
    return [];
  }

  // Filter to valid single-character keys typed during the session
  const validEntries = Object.entries(keyStats).filter(([k, v]) => {
    const clean = k.trim().toLowerCase();
    return clean.length === 1 && v.total > 0;
  });

  if (validEntries.length === 0) return [];

  // Group 1: Keys where actual errors were committed
  const withErrors = validEntries.filter(([_, v]) => v.errors > 0);

  if (withErrors.length > 0) {
    // Sort errors by total count descending, then by error rate (errors / total), then latency
    withErrors.sort((a, b) => {
      if (b[1].errors !== a[1].errors) {
        return b[1].errors - a[1].errors;
      }
      const errRateA = a[1].errors / a[1].total;
      const errRateB = b[1].errors / b[1].total;
      if (errRateB !== errRateA) {
        return errRateB - errRateA;
      }
      const latA = (a[1].totalMs || 0) / a[1].total;
      const latB = (b[1].totalMs || 0) / b[1].total;
      return latB - latA;
    });

    const errorKeys = withErrors.map(([k]) => k.toLowerCase());
    if (errorKeys.length >= limit) {
      return errorKeys.slice(0, limit);
    }

    // If fewer than limit error keys, supplement with the slowest reaction keys from this test
    const remaining = validEntries
      .filter(([k]) => !errorKeys.includes(k.toLowerCase()))
      .sort((a, b) => {
        const latA = (a[1].totalMs || 0) / a[1].total;
        const latB = (b[1].totalMs || 0) / b[1].total;
        return latB - latA;
      })
      .map(([k]) => k.toLowerCase());

    return [...errorKeys, ...remaining].slice(0, limit);
  }

  // Group 2: Zero errors (100% accuracy) — sort by highest latency (slowest finger transitions)
  const byLatency = [...validEntries].sort((a, b) => {
    const latA = (a[1].totalMs || 0) / a[1].total;
    const latB = (b[1].totalMs || 0) / b[1].total;
    return latB - latA;
  });

  return byLatency.slice(0, limit).map(([k]) => k.toLowerCase());
}

// Comprehensive vocabulary dictionary optimized for error correction
const DRILL_VOCABULARY = [
  // Multi-key / common transition words
  "track", "trust", "train", "trait", "treat", "threat", "target", "rotate", "return", "transit",
  "retreat", "starter", "structure", "matter", "master", "matrix", "meteor", "mortar", "martyr",
  "smart", "storm", "stream", "rhythm", "remote", "metric", "mirror", "format", "temper", "timber",
  "sector", "rector", "vector", "static", "strata", "artist", "attire", "letter", "little", "settle",
  "better", "bitter", "butter", "batter", "bottle", "battle", "beetle", "cattle", "cotton", "motto",
  "button", "bottom", "custom", "system", "symptom", "mystic", "cryptic", "kinetic", "static", "drastic",
  "elastic", "plastic", "tactic", "optic", "topic", "exotic", "toxic", "chaos", "cosmic", "atomic",
  // Q & Z & X heavy words
  "quick", "quiet", "quest", "quote", "quantum", "quiz", "squid", "squad", "equal", "opaque",
  "unique", "antique", "acquire", "require", "conquer", "liquid", "equip", "equity", "plaque",
  "zero", "zone", "zinc", "freeze", "breeze", "blaze", "crazy", "citizen", "horizon", "puzzle",
  "drizzle", "resize", "organize", "analyze", "optimize", "amaze", "hazard", "wizard", "bizarre",
  "complex", "pixel", "exact", "explore", "context", "boxing", "oxygen", "toxic", "luxury", "dynamic",
  "flexible", "execute", "extend", "expert", "matrix", "vertex", "syntax", "prefix", "suffix", "reflex",
  // J & K & V & W heavy words
  "jump", "judge", "project", "adjust", "jacket", "journal", "major", "object", "inject", "eject",
  "reject", "subject", "journey", "trajectory", "justify", "ninja", "banjo", "jungle", "junior",
  "keyboard", "kinetic", "strike", "stroke", "spark", "skill", "shock", "check", "block", "break",
  "seek", "speak", "peak", "leak", "blank", "link", "flock", "track", "crack", "black", "thick",
  "velocity", "verify", "vector", "visual", "vowel", "wave", "curve", "nerve", "deliver", "provide",
  "resolve", "active", "drive", "advance", "thrive", "vivid", "brave", "crave", "grave", "pave",
  "world", "work", "power", "tower", "flower", "shower", "lower", "slow", "glow", "flow", "blow",
  "grow", "throw", "window", "shadow", "arrow", "narrow", "sorrow", "borrow", "yellow", "follow",
  // P & B & F & M heavy words
  "paper", "pepper", "piper", "proper", "purple", "people", "simple", "sample", "temple", "dimple",
  "ripple", "cripple", "apple", "grape", "group", "grasp", "clamp", "stamp", "tramp", "cramp",
  "bubble", "pebble", "rubble", "cobble", "double", "trouble", "noble", "table", "cable", "fable",
  "fiber", "fever", "flavor", "filter", "foster", "faster", "factor", "figure", "finger", "future",
  "memory", "member", "summer", "hammer", "simmer", "dimmer", "glimmer", "glamour", "clamour",
  // C & G & H & Y heavy words
  "circle", "circus", "cycle", "cynic", "clinic", "comic", "magic", "logic", "tragic", "music",
  "galaxy", "gadget", "gauge", "glory", "glove", "grove", "grave", "grace", "grape", "grain",
  "hybrid", "hyper", "glyph", "python", "rhythm", "symbol", "syntax", "system", "symptom", "synergy",
  // High-frequency core muscle-memory patterns
  "speed", "sprint", "swift", "rapid", "pulse", "flash", "spark", "blitz", "burst", "surge",
  "tempo", "cadence", "racer", "drift", "shift", "glide", "slide", "stride", "climb", "crest"
];

/**
 * Generates an error-correction drill where EVERY word contains the user's bottleneck keys.
 * Words are ranked and selected strictly based on the MAXIMUM concentration of bottleneck keys.
 */
export function generateTargetedWeaknessDrill(bottleneckKeys: string[], wordCount = 60): string {
  if (!bottleneckKeys || bottleneckKeys.length === 0) {
    bottleneckKeys = ['e', 't', 'r'];
  }

  const cleanKeys = bottleneckKeys.map(k => k.toLowerCase().trim()).filter(Boolean);
  const keysSet = new Set(cleanKeys);

  // Helper to count how many bottleneck keys appear in a word
  const scoreWord = (word: string): { matches: number; density: number } => {
    let count = 0;
    const lower = word.toLowerCase();
    for (const char of lower) {
      if (keysSet.has(char)) count++;
    }
    return {
      matches: count,
      density: word.length > 0 ? count / word.length : 0,
    };
  };

  // 1. Filter ALL words that contain AT LEAST one bottleneck key
  const scoredWords = DRILL_VOCABULARY
    .map(w => ({ word: w, ...scoreWord(w) }))
    .filter(item => item.matches > 0);

  // 2. Sort words by:
  // - Primary: total matches of bottleneck keys (words with 3 or 4 bottleneck letters first!)
  // - Secondary: density (matches / length)
  scoredWords.sort((a, b) => {
    if (b.matches !== a.matches) return b.matches - a.matches;
    return b.density - a.density;
  });

  if (scoredWords.length === 0) {
    return cleanKeys.map(k => `${k}${k} ${k}a${k} ${k}e${k} ${k}o${k}`).join(' ');
  }

  // 3. Select the highest-density words and assemble the drill
  // Take top words, repeat with dynamic variation to build strong neural muscle memory
  const selectedList: string[] = [];
  const topTier = scoredWords.slice(0, Math.min(30, scoredWords.length)).map(x => x.word);
  const midTier = scoredWords.slice(0, Math.min(60, scoredWords.length)).map(x => x.word);

  // Phase 1: High-concentration focal clusters
  for (let i = 0; i < Math.floor(wordCount * 0.6); i++) {
    const word = topTier[i % topTier.length];
    selectedList.push(word);
  }

  // Phase 2: Varied cadence words from mid-tier containing bottleneck keys
  for (let i = 0; i < Math.ceil(wordCount * 0.4); i++) {
    const word = midTier[(i * 3 + 1) % midTier.length];
    selectedList.push(word);
  }

  // Shuffle lightly to ensure natural cadence while keeping high density
  for (let i = selectedList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedList[i], selectedList[j]] = [selectedList[j], selectedList[i]];
  }

  return selectedList.join(' ');
}
