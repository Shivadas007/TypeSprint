# ⚡ Type Sprint — Premium AI-Powered Typing Mastery Platform

> **"Train Your Fingers. Master Your Flow."**

Type Sprint is a production-grade typing speed test and keyboard athletics platform inspired by the **Cosmic Core** visual aesthetic. It merges deep space technology aesthetics with real-time neuromuscular diagnostics, an adaptive AI Typing Coach, code typing modes, and downloadable achievement certifications.

---

## 🚀 Key Features

- 🏎️ **Precision Typing Engine**
  - Instant start without forced registration
  - Industry-standard WPM calculation: `(correct characters ÷ 5) ÷ minutes`
  - Raw WPM, accuracy %, consistency % (coefficient of variation)
  - Character-level tactile feedback (luminous cyan correct, red error badge)
  - Smooth upward line escalation flow (no jarring vertical page jumps)
  - Web Audio synthesis for mechanical key clicks, spacebar resonance, and finish fanfares
- 🧠 **Neural AI Typing Coach**
  - Analyzes character transition latencies, mistyped n-grams, and finger zone fatigue
  - Generates a customized daily training curriculum
  - Synthesizes personalized practice passages tailored to your exact weak keys
  - Powered server-side by Google Gemini (`@google/genai`) with graceful fallback
- 🎮 **Multi-Mode Keyboard Arena**
  - **Classic**: Standard 15s, 30s, 60s, 120s sessions
  - **Time Attack**: Peak velocity overdrive
  - **Precision**: Strict accuracy threshold enforcement
  - **Zen**: Distraction-free, minimal flow state
  - **Code Mode**: Real syntax for JavaScript, Python, C++, HTML, and SQL
  - **Quotes**: Famous engineering, philosophy, and literature passages
  - **Word Sprint**: Fixed 25, 50, or 100 word sprints
  - **Endless Mode**: Sudden death endurance challenge
- 📊 **Session Results HUD & Official Certification**
  - Interactive second-by-second velocity curve
  - Real-time QWERTY keyboard heatmap highlighting weak keys
  - High-resolution HTML5 canvas certificate generator (Download PNG & Copy Summary)
- 🏆 **Progression & Monetization System**
  - Level 1-100 XP progression with mastery titles
  - Unlockable badges (First Sprint, Century Club, Hypersonic, Sniper Accuracy, etc.)
  - Global filterable leaderboards (Daily, Weekly, Monthly, All-Time)
  - Tiered membership (Free, Pro ₹199/mo, Master ₹499/mo) with currency toggle (INR/USD)
  - 7-day Pro trial with server-side payment verification architecture (Razorpay / Stripe)
- 📱 **Progressive Web App (PWA) & Offline Capability**
  - Offline service worker caching
  - In-app install banner with iOS Safari instructions
  - 5 theme palettes: Cosmic Core, Midnight Void, Cyber Neon, Aurora, and Minimal Light

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas 2D
- **Backend**: Express server with Vite middleware mode integration
- **AI Engine**: Google Gemini API (`@google/genai`, model `gemini-3.8-flash`)
- **PWA**: Service Worker with Stale-While-Revalidate and Web App Manifest
- **Audio**: Web Audio API native synthesis (zero external audio asset latency)

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/type-sprint.git
cd type-sprint

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Set the following variables:

```ini
GEMINI_API_KEY="your-google-ai-studio-gemini-key"
APP_URL="http://localhost:3000"
PORT=3000
NODE_ENV="development"
```

### Running Locally

```bash
# Start full-stack dev server with Vite middleware
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build & Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

Deployable directly on modern hosting platforms (Cloud Run, Railway, Render, Vercel, Netlify).

---

## 📄 License

MIT © 2026 Type Sprint. All rights reserved.
