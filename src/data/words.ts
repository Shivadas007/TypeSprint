// Type Sprint Word Pools & Datasets
// Retaining and augmenting the original tiered word architecture

export const easyWords = [
  "the","be","of","and","a","to","in","he","have","it","that","for","they","with",
  "as","not","on","she","at","by","this","we","you","do","but","from","or","which",
  "would","all","will","there","say","who","make","when","can","more","if","no",
  "man","out","other","so","what","time","up","go","about","than","into","could",
  "state","only","new","year","some","take","come","these","know","see","use","get",
  "like","then","first","any","work","now","may","such","give","over","think","most",
  "even","find","day","also","after","way","many","must","look","before","great",
  "back","through","long","where","much","should","well","people","down","own","just",
  "because","good","each","those","feel","seem","how","high","too","place","little",
  "world","very","still","hand","old","life","tell","write","become","here","show",
  "house","both","between","need","mean","call","under","last","right","move","thing",
  "school","never","same","another","begin","while","number","part","turn","real",
  "leave","might","want","point","form","off","child","few","small","since","against",
  "ask","late","home","interest","large","person","end","open","public","follow",
  "during","present","without","again","hold","around","possible","head","consider",
  "word","program","problem","however","lead","system","set","order","eye","plan",
  "run","keep","face","fact","group","play","stand","increase","early","course",
  "change","help","line","city","put","close","case","force","meet","once","water",
  "upon","war","build","hear","light","live","every","country","bring","center","let",
  "side","try","provide","continue","name","certain","power","pay","result","question",
  "study","woman","member","until","far","night","always","service","away","report",
  "something","company","week","toward","start","social","room","figure","nature",
  "focus","speed","flow","typing","mastery","rhythm","motion","energy","pulse",
  "hello,","hey,","hi,","well,","so,","wait,","look,","first,","yes.","no.",
  "okay.","fine.","sure.","good.","great.","right?","ready?","yes!","no!",
  "oh,","but,","and,","then,","now,","please.","thanks.","stop!","wait!",
  "help!","nice!","cool!","good!","okay!","sure!","home.","day.","night.",
  "way.","life.","time.","love.","dream.","hope.","world.","friend.","heart."
];

export const moderateWords = [
  "don't","can't","won't","isn't","aren't","didn't","doesn't","wasn't","weren't",
  "couldn't","shouldn't","wouldn't","haven't","hasn't","hadn't","I'm","I've",
  "I'll","I'd","you're","you've","you'll","you'd","he's","he'll","she's","she'll",
  "it's","it'll","we're","we've","we'll","they're","they've","they'll","that's",
  "there's","here's","what's","who's","let's",
  "Hello","Hi","Hey","Oh","Well","Yes","No","Wait","Sure","Actually","Anyway",
  "Besides","However","Look","Listen","Right","Okay","Alright","Great","Perfect",
  "Thanks","Thank","Sorry","Please","Really","Absolutely","Definitely","Probably",
  "Maybe","Indeed","Exactly","Wow","Whoa","Hmm","Fine","Good","This","That",
  "These","Those","One","Two","First","Last","Next","Every","My","Your","Our",
  "algorithm","bandwidth","interface","database","keyboard","accuracy","velocity",
  "performance","optimization","latency","protocol","network","processor","display",
  "1","2","3","4","5","6","7","8","9","10","11","12","15","20","30","40","50","60","100","2025"
];

export const expertWords = [
  "13","14","16","17","18","19","21","70","80","90","101","500","1000","365",
  "24","7","99","1984","42","3.14","0.5","2.5","1.5","99.9","12:30","7:45",
  "$100","$50","$20","$10","$500","100%","50%","25%","10%","75%","@home",
  "@work","@school","#1","#2","#team","#love","#typing","#winning","x-ray",
  "e-mail","well-known","so-called","high-tech","state-of-the-art","part-time",
  "full-time","up-to-date","user-friendly","self-confidence","good-looking",
  "world-class","R&D","Q&A","A&B","+1","-5","$99.99","%&@","#!#","*star*",
  "!important","100x","2.0","3D","Wi-Fi","T-shirt","well-being",
  "decision-making","long-term","short-term","high-quality","first-class",
  "asynchronous","cryptographic","superposition","deterministic","concurrency",
  "John","Sarah","Alex","Sam","Monday","Tuesday","Wednesday","Thursday","Friday",
  "Saturday","Sunday","London","Paris","Tokyo","New York","USA","NASA","AI","CEO"
];

export const quotes = [
  {
    text: "The quick brown fox jumps over the lazy dog.",
    author: "Classic Pangram"
  },
  {
    text: "Simplicity is prerequisite for reliability. Complex systems always break in complex ways.",
    author: "Edsger W. Dijkstra"
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds"
  },
  {
    text: "The best way to predict the future is to invent it with discipline and focus.",
    author: "Alan Kay"
  },
  {
    text: "Flow is the mental state where a person performing an activity is fully immersed in energized focus.",
    author: "Mihaly Csikszentmihalyi"
  },
  {
    text: "First, solve the problem. Then, write the code with surgical precision.",
    author: "John Johnson"
  },
  {
    text: "Small daily improvements over time lead to stunning results. Train your fingers to master your flow.",
    author: "Robin Sharma"
  }
];

export const codeSnippets: Record<string, string[]> = {
  javascript: [
    "const calculateWpm = (chars, seconds) => Math.round((chars / 5) / (seconds / 60));",
    "async function fetchMetrics(userId) { const res = await fetch(`/api/stats/${userId}`); return res.json(); }",
    "export const debounce = (fn, ms) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };",
    "const uniqueKeys = new Set(keystrokeLog.map(event => event.key.toLowerCase()));",
    "const stream = chunks.reduce((acc, chunk) => acc + chunk.payload, '');"
  ],
  python: [
    "def calculate_wpm(correct_chars: int, elapsed_sec: float) -> float:\n    return round((correct_chars / 5) / (elapsed_sec / 60), 2)",
    "class TypingTelemetry:\n    def __init__(self, user_id: str):\n        self.user_id = user_id\n        self.history = []",
    "from dataclasses import dataclass\n@dataclass\nclass Keystroke:\n    char: str\n    latency_ms: float\n    is_error: bool = False",
    "filtered = [sample for sample in telemetry_samples if sample['accuracy'] > 0.95]"
  ],
  cpp: [
    "int calculateWPM(int correctChars, double timeMinutes) { return static_cast<int>((correctChars / 5.0) / timeMinutes); }",
    "template <typename T> void logMetric(const std::string& key, const T& value) { std::cout << key << \": \" << value << std::endl; }",
    "std::vector<std::string> tokenStream = splitWords(rawTextBuffer);"
  ],
  html: [
    "<div class=\"cosmic-card p-6 rounded-2xl border border-cyan-500/20 bg-slate-900/60\"><h3 class=\"text-xl font-bold text-cyan-400\">Velocity HUD</h3></div>",
    "<button type=\"button\" aria-label=\"Restart Sprint\" class=\"px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500\">Restart</button>"
  ],
  sql: [
    "SELECT user_id, MAX(wpm) AS best_wpm, AVG(accuracy) AS avg_acc FROM typing_tests GROUP BY user_id ORDER BY best_wpm DESC LIMIT 10;",
    "INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES ('usr_101', 'ach_century_speed', NOW());",
    "UPDATE subscriptions SET status = 'active', plan_tier = 'master' WHERE order_id = 'ord_live_8912';"
  ]
};

export const wordPools = {
  easy: easyWords,
  moderate: easyWords.concat(moderateWords),
  expert: easyWords.concat(moderateWords, expertWords),
};

export function getRandomWord(level: 'easy' | 'moderate' | 'expert' = 'easy', forceCapital = false): string {
  const pool = wordPools[level] || wordPools.easy;
  let word = pool[Math.floor(Math.random() * pool.length)];

  if (forceCapital) {
    for (let i = 0; i < 10; i++) {
      if (/^[a-z]/.test(word)) break;
      word = pool[Math.floor(Math.random() * pool.length)];
    }
    if (/^[a-z]/.test(word)) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
  }
  return word;
}

export function endsSentence(word: string): boolean {
  return /[.!?]$/.test(word);
}
