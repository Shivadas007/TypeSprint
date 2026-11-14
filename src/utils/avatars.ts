// Curated Animated Cartoon Avatars & Generator Utilities

export interface CartoonAvatar {
  id: string;
  name: string;
  url: string;
  category: 'robot' | 'emoji' | 'character' | 'cosmic';
}

export const PRESET_CARTOON_AVATARS: CartoonAvatar[] = [
  {
    id: 'cyber_bot_1',
    name: 'Cyber Bot 9000',
    category: 'robot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyberbot9&backgroundColor=070d1d',
  },
  {
    id: 'neon_spark',
    name: 'Neon Spark',
    category: 'robot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=sparkplug&backgroundColor=0f172a',
  },
  {
    id: 'happy_flow',
    name: 'Happy Flow',
    category: 'emoji',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=flowrunner&backgroundColor=070d1d',
  },
  {
    id: 'cosmic_cheer',
    name: 'Cosmic Cheer',
    category: 'emoji',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cosmiccheer&backgroundColor=1e1b4b',
  },
  {
    id: 'astro_ace',
    name: 'Astro Ace',
    category: 'character',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=astroace&backgroundColor=070d1d',
  },
  {
    id: 'matrix_pilot',
    name: 'Matrix Pilot',
    category: 'character',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=matrixpilot&backgroundColor=091738',
  },
  {
    id: 'lorelei_star',
    name: 'Lorelei Star',
    category: 'cosmic',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=loreleistar&backgroundColor=070d1d',
  },
  {
    id: 'quantum_coder',
    name: 'Quantum Coder',
    category: 'robot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantumcoder&backgroundColor=030712',
  },
];

/**
 * Deterministically generates a random animated cartoon avatar URL based on a username or seed
 */
export function generateRandomCartoonAvatar(seed: string): string {
  const styles = ['bottts', 'fun-emoji', 'adventurer', 'lorelei'];
  // Deterministic pick based on seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const chosenStyle = styles[Math.abs(hash) % styles.length];
  const safeSeed = encodeURIComponent(seed.trim().toLowerCase() || 'typesprint');
  return `https://api.dicebear.com/7.x/${chosenStyle}/svg?seed=${safeSeed}&backgroundColor=070d1d`;
}

/**
 * Fallback inline SVG data URI in case network is down or external avatar fails to load
 */
export const DEFAULT_CARTOON_AVATAR_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="24" fill="#070e24"/>
  <circle cx="50" cy="42" r="22" fill="#06b6d4" opacity="0.9"/>
  <circle cx="43" cy="38" r="4" fill="#ffffff"/>
  <circle cx="57" cy="38" r="4" fill="#ffffff"/>
  <circle cx="44" cy="38" r="2" fill="#020617"/>
  <circle cx="58" cy="38" r="2" fill="#020617"/>
  <path d="M 40 48 Q 50 56 60 48" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M 26 84 C 26 68, 74 68, 74 84 Z" fill="#38bdf8" opacity="0.85"/>
  <circle cx="50" cy="18" r="3" fill="#38bdf8"/>
  <line x1="50" y1="18" x2="50" y2="23" stroke="#38bdf8" stroke-width="2"/>
</svg>
`);
