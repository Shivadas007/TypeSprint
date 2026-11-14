import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.set('trust proxy', 1);

// Enforce HTTPS in production behind reverse proxies (excluding local dev & health checks)
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = (req.headers.host || '').split(':')[0];
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  if (
    process.env.NODE_ENV === 'production' &&
    !isLocal &&
    req.path !== '/api/health' &&
    req.headers['x-forwarded-proto'] === 'http'
  ) {
    res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    return;
  }
  next();
});

// Production Security Headers (preserving iframe preview compatibility)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(express.json({ limit: '100kb' }));

// Lightweight in-memory rate limiter for AI endpoints
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip || 'unknown'}:${req.path}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (bucket.count >= maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
      return;
    }
    bucket.count += 1;
    next();
  };
}

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Type Sprint',
    version: '2.5.0',
    aiAvailable: !!geminiClient,
    timestamp: new Date().toISOString(),
  });
});

// Timeout helper for resilient AI calls
function withAiTimeout<T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), timeoutMs)),
  ]);
}

// AI Typing Coach Endpoint
app.post('/api/ai/coach', rateLimit(30, 60_000), async (req: Request, res: Response) => {
  const { recentResults, slowKeys = [], weakFingers = [], avgWpm = 65, accuracy = 94 } = req.body;

  if (!geminiClient) {
    res.json(generateFallbackCoachReport(slowKeys, weakFingers, avgWpm, accuracy));
    return;
  }

  try {
    const prompt = `You are the lead AI Biomechanical Typing Coach for Type Sprint, a futuristic typing mastery platform.
Analyze this user's typing data:
- Average WPM: ${avgWpm}
- Accuracy: ${accuracy}%
- Frequently mistyped / slow keys: ${slowKeys.length > 0 ? slowKeys.join(', ') : 'P, Q, X, Z, semicolon, numbers'}
- Weak finger zones: ${weakFingers.length > 0 ? weakFingers.join(', ') : 'Left Pinky, Right Ring'}
- Recent test counts: ${recentResults?.length || 5}

Provide a comprehensive, professional diagnostic evaluation in strict JSON format:
{
  "biomechanicalSummary": "string describing neuromuscular speed vs accuracy balance",
  "keyWeaknesses": ["string point 1", "string point 2", "string point 3"],
  "fingerFatigueWarning": "string",
  "speedBottlenecks": ["string point 1", "string point 2"],
  "todaysTrainingPlan": [
    { "drill": "Punctuation & Symbols", "durationMinutes": 5, "targetWpm": ${Math.round(avgWpm * 0.9)}, "description": "High-density symbol sequences to calibrate finger reach" },
    { "drill": "Weak-Key Target Drill", "durationMinutes": 8, "targetWpm": ${Math.round(avgWpm * 0.85)}, "description": "Isolating ring and pinky finger transitions" },
    { "drill": "Sprint Flow State", "durationMinutes": 10, "targetWpm": ${Math.round(avgWpm * 1.1)}, "description": "Pushing burst velocity on rhythmic home-row words" }
  ],
  "nextSpeedMilestone": "${Math.min(150, Math.ceil((avgWpm + 10) / 10) * 10)} WPM"
}`;

    const response = await withAiTimeout(
      geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      4000
    );

    const text = response.text || '';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    res.json(generateFallbackCoachReport(slowKeys, weakFingers, avgWpm, accuracy));
  }
});

// AI Generate Practice Text Endpoint (Real-time Error Correction Engine)
app.post('/api/ai/generate-practice', rateLimit(40, 60_000), async (req: Request, res: Response) => {
  const { topic = 'Error Correction', weakKeys = ['e', 'r', 't'], targetWpm = 75, isWeaknessDrill = true } = req.body;
  const cleanKeys = Array.isArray(weakKeys)
    ? weakKeys.map((k: string) => String(k).toLowerCase().trim()).filter((k: string) => k.length === 1)
    : ['e', 'r', 't'];

  if (!geminiClient) {
    res.json({
      text: getCuratedPracticeText(topic, cleanKeys),
      topic,
      weakKeys: cleanKeys,
      isAiGenerated: false,
    });
    return;
  }

  try {
    const prompt = cleanKeys.length > 0
      ? `You are an elite typing biomechanics error-correction engine.
The typist's specific diagnosed bottleneck keys are: [${cleanKeys.join(', ')}].

TASK: Generate a high-intensity, targeted error-correction practice drill (55 to 75 words).
CRITICAL ERROR-CORRECTION RULES:
1. EVERY SINGLE WORD in the drill MUST contain at least one of these bottleneck letters: [${cleanKeys.join(', ')}].
2. Prioritize words that contain MULTIPLE bottleneck letters to maximize finger muscle memory correction (e.g. if bottleneck keys are "t, r", heavily prioritize words like "track, trust, train, rotate, return, matrix, start, target, stream, transit, retreat, structure").
3. DO NOT include generic filler words (avoid words like "and, of, in, on, the" unless they contain the target letters).
4. All words must be real, valid English words.
5. Output ONLY the raw practice words separated by spaces without any intro, markdown, quotes or commentary.`
      : `Generate a high-flow, engaging typing practice passage (around 60 to 90 words) on the topic "${topic}". Output ONLY the raw passage text without any formatting.`;

    const response = await withAiTimeout(
      geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      }),
      4000
    );

    const generatedText = (response.text || '').trim().replace(/^["']|["']$/g, '');
    if (!generatedText || generatedText.length < 20) {
      throw new Error('Empty response from AI');
    }

    res.json({
      text: generatedText,
      topic,
      weakKeys: cleanKeys,
      isAiGenerated: true,
    });
  } catch (err) {
    res.json({
      text: getCuratedPracticeText(topic, cleanKeys),
      topic,
      weakKeys: cleanKeys,
      isAiGenerated: false,
    });
  }
});

// AI Performance Report Generator
app.post('/api/ai/analyze-report', rateLimit(40, 60_000), async (req: Request, res: Response) => {
  const { testResult } = req.body;
  const wpm = testResult?.wpm || 75;
  const acc = testResult?.acc || 96;
  const cons = testResult?.cons || 88;

  if (!geminiClient) {
    res.json(generateFallbackPerformanceReport(testResult));
    return;
  }

  try {
    const prompt = `Analyze this completed typing session on Type Sprint:
- Speed: ${wpm} WPM
- Accuracy: ${acc}%
- Consistency: ${cons}%
- Duration: ${testResult?.time || 60} seconds
- Test Mode: ${testResult?.level || 'moderate'}

Return a structured JSON report:
{
  "grade": "S | A+ | A | B | C",
  "velocityVerdict": "short sentence on pace",
  "accuracyAssessment": "analysis of error distribution",
  "rhythmicConsistency": "analysis of cadence and hesitation",
  "fingerCoordinationAdvice": "actionable biomechanical tip",
  "projectedPeakWpm": ${Math.round(wpm * 1.25)}
}`;

    const response = await withAiTimeout(
      geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      3500
    );

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err) {
    res.json(generateFallbackPerformanceReport(testResult));
  }
});

function generateFallbackCoachReport(slowKeys: string[], weakFingers: string[], avgWpm: number, accuracy: number) {
  return {
    biomechanicalSummary: `Your cadence demonstrates strong burst capacity (${avgWpm} WPM), but micro-hesitations around periphery keys cause a ${Math.max(2, 100 - accuracy)}% accuracy leakage.`,
    keyWeaknesses: [
      slowKeys.length > 0 ? `Unstable finger placement on: ${slowKeys.slice(0, 4).join(', ')}` : 'Slight hesitation when shifting to punctuation keys (;, ., -)',
      'Sub-optimal finger curling on upper number row transitions',
      'Asymmetric recovery latency between left and right hand keystrokes',
    ],
    fingerFatigueWarning: 'Maintain relaxed wrist elevation; avoid resting your palms directly on the desk during sprints over 60 seconds.',
    speedBottlenecks: [
      'Burst-stop rhythm: typing common words at 90+ WPM then dropping to 45 WPM on contractions',
      'Backspace over-correction penalty averaging 1.4 seconds per error',
    ],
    todaysTrainingPlan: [
      {
        drill: 'Precision Calibration',
        durationMinutes: 5,
        targetWpm: Math.max(40, Math.round(avgWpm * 0.85)),
        description: 'Enforce 98%+ accuracy threshold with strict home-row discipline.',
      },
      {
        drill: 'Peripheral & Symbol Flow',
        durationMinutes: 8,
        targetWpm: Math.max(45, Math.round(avgWpm * 0.9)),
        description: 'Repeated n-gram patterns focusing on weak outer fingers.',
      },
      {
        drill: 'Velocity Overdrive Sprint',
        durationMinutes: 10,
        targetWpm: Math.round(avgWpm * 1.12),
        description: 'Short 15-second burst sets designed to break mechanical speed ceilings.',
      },
    ],
    nextSpeedMilestone: `${Math.min(160, Math.ceil((avgWpm + 10) / 10) * 10)} WPM`,
  };
}

function generateFallbackPerformanceReport(result: any) {
  const wpm = result?.wpm || 70;
  const acc = result?.acc || 95;
  const grade = wpm >= 120 && acc >= 98 ? 'S' : wpm >= 90 ? 'A+' : wpm >= 75 ? 'A' : wpm >= 50 ? 'B' : 'C';

  return {
    grade,
    velocityVerdict: `Demonstrated strong baseline speed with peak flow efficiency at ${wpm} WPM.`,
    accuracyAssessment: `Maintained ${acc}% accuracy across ${result?.words || 45} completed words.`,
    rhythmicConsistency: `Consistency metric clocked at ${result?.cons || 90}%, reflecting disciplined neuromuscular tempo.`,
    fingerCoordinationAdvice: 'Prioritize anticipatory eye movement: read 2-3 words ahead of your active keystroke position.',
    projectedPeakWpm: Math.round(wpm * 1.22),
  };
}

function getCuratedPracticeText(topic: string, weakKeys: string[] = ['e', 'r', 't']): string {
  const dictionary = [
    "track", "trust", "train", "trait", "treat", "threat", "target", "rotate", "return", "transit",
    "retreat", "starter", "structure", "matter", "master", "matrix", "meteor", "mortar", "martyr",
    "smart", "storm", "stream", "rhythm", "remote", "metric", "mirror", "format", "temper", "timber",
    "sector", "rector", "vector", "static", "strata", "artist", "attire", "letter", "little", "settle",
    "better", "bitter", "butter", "batter", "bottle", "battle", "beetle", "cattle", "cotton", "motto",
    "button", "bottom", "custom", "system", "symptom", "mystic", "cryptic", "kinetic", "drastic",
    "elastic", "plastic", "tactic", "optic", "topic", "exotic", "toxic", "chaos", "cosmic", "atomic",
    "quick", "quiet", "quest", "quote", "quantum", "quiz", "squid", "squad", "equal", "opaque",
    "unique", "antique", "acquire", "require", "conquer", "liquid", "equip", "equity", "plaque",
    "zero", "zone", "zinc", "freeze", "breeze", "blaze", "crazy", "citizen", "horizon", "puzzle",
    "drizzle", "resize", "organize", "analyze", "optimize", "amaze", "hazard", "wizard", "bizarre",
    "complex", "pixel", "exact", "explore", "context", "boxing", "oxygen", "luxury", "dynamic",
    "flexible", "execute", "extend", "expert", "vertex", "syntax", "prefix", "suffix", "reflex",
    "jump", "judge", "project", "adjust", "jacket", "journal", "major", "object", "inject", "eject",
    "reject", "subject", "journey", "trajectory", "justify", "ninja", "banjo", "jungle", "junior",
    "keyboard", "kinetic", "strike", "stroke", "spark", "skill", "shock", "check", "block", "break",
    "seek", "speak", "peak", "leak", "blank", "link", "flock", "crack", "black", "thick",
    "velocity", "verify", "visual", "vowel", "wave", "curve", "nerve", "deliver", "provide",
    "resolve", "active", "drive", "advance", "thrive", "vivid", "brave", "crave", "grave", "pave",
    "world", "work", "power", "tower", "flower", "shower", "lower", "slow", "glow", "flow", "blow",
    "grow", "throw", "window", "shadow", "arrow", "narrow", "sorrow", "borrow", "yellow", "follow",
    "paper", "pepper", "piper", "proper", "purple", "people", "simple", "sample", "temple", "dimple",
    "ripple", "apple", "grape", "group", "grasp", "clamp", "stamp", "tramp", "cramp",
    "bubble", "pebble", "rubble", "cobble", "double", "trouble", "noble", "table", "cable", "fable",
    "fiber", "fever", "flavor", "filter", "foster", "faster", "factor", "figure", "finger", "future",
    "memory", "member", "summer", "hammer", "simmer", "dimmer", "glimmer", "glamour",
    "circle", "circus", "cycle", "cynic", "clinic", "comic", "magic", "logic", "tragic", "music",
    "galaxy", "gadget", "gauge", "glory", "glove", "grove", "grace", "grain",
    "hybrid", "hyper", "glyph", "python", "symbol", "synergy",
    "speed", "sprint", "swift", "rapid", "pulse", "flash", "blitz", "burst", "surge",
    "tempo", "cadence", "racer", "drift", "shift", "glide", "slide", "stride", "climb", "crest"
  ];

  if (!weakKeys || weakKeys.length === 0) {
    weakKeys = ['e', 'r', 't'];
  }

  const cleanKeys = weakKeys.map(k => k.toLowerCase().trim()).filter(Boolean);
  const keysSet = new Set(cleanKeys);

  // Score words by number of bottleneck keys they contain
  const scored = dictionary
    .map(w => {
      let count = 0;
      for (const ch of w.toLowerCase()) {
        if (keysSet.has(ch)) count++;
      }
      return { word: w, count, density: count / w.length };
    })
    .filter(item => item.count > 0);

  scored.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.density - a.density;
  });

  if (scored.length === 0) {
    return cleanKeys.map(k => `${k}${k} ${k}a${k} ${k}e${k}`).join(' ');
  }

  const topTier = scored.slice(0, 30).map(x => x.word);
  const drillWords: string[] = [];
  const targetCount = 65;

  for (let i = 0; i < targetCount; i++) {
    drillWords.push(topTier[i % topTier.length]);
  }

  // Shuffle lightly
  for (let i = drillWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [drillWords[i], drillWords[j]] = [drillWords[j], drillWords[i]];
  }

  return drillWords.join(' ');
}

// Catch-all 404 handler for unknown API routes
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Development Vite Middleware setup or Production Static serving with browser caching
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '7d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Type Sprint server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
