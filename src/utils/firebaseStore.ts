import {
  User as FirebaseUser,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { TestResult, ThemeId, UserProfile } from '../types';
import { generateRandomCartoonAvatar } from './avatars';

export interface PublicLeaderboardEntry {
  rank: number;
  uid: string;
  username: string;
  name: string;
  avatarUrl: string;
  wpm: number;
  accuracy: number;
  consistency: number;
  tests: number;
  badge: string;
}

const VALID_THEMES: ThemeId[] = ['cosmic', 'midnight', 'cyber', 'aurora', 'light'];

export function sanitizeUsername(raw: string, fallbackSeed = 'athlete'): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 32);

  if (cleaned.length >= 3) return cleaned;
  const suffix = fallbackSeed
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 8) || '001';
  return `typist_${suffix}`.slice(0, 32);
}

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || `id_${Date.now()}`;
}

export function deriveBadgeFromWpm(wpm: number): string {
  if (wpm >= 130) return 'Cosmic Apex';
  if (wpm >= 100) return 'Velocity Master';
  if (wpm >= 75) return 'Kinetic Ace';
  if (wpm >= 45) return 'Flow Runner';
  return 'Speed Athlete';
}

function clampInt(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, Math.round(val)));
}

function clampNum(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, Number(val)));
}

function mapDocToUserProfile(uid: string, data: Record<string, any>): UserProfile {
  const theme = VALID_THEMES.includes(data.themePreference) ? data.themePreference : 'cosmic';
  return {
    id: uid,
    name: typeof data.name === 'string' && data.name.trim() ? data.name : 'Speed Athlete',
    username: typeof data.username === 'string' && data.username ? data.username : sanitizeUsername(uid),
    email: typeof data.email === 'string' ? data.email : '',
    plan: 'free',
    subscriptionStatus: 'none',
    avatarUrl:
      typeof data.avatarUrl === 'string' && data.avatarUrl
        ? data.avatarUrl
        : generateRandomCartoonAvatar(uid),
    streak: clampInt(Number(data.streak || 0), 0, 10000),
    longestStreak: clampInt(Number(data.longestStreak || 0), 0, 10000),
    xp: clampInt(Number(data.xp || 0), 0, 100000000),
    level: clampInt(Number(data.level || 1), 1, 10000),
    bestWpm: clampInt(Number(data.bestWpm || 0), 0, 350),
    avgWpm: clampInt(Number(data.avgWpm || 0), 0, 350),
    testsCompleted: clampInt(Number(data.testsCompleted || 0), 0, 1000000),
    themePreference: theme,
    soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true,
  };
}

export async function signInWithGoogleAccount(): Promise<UserProfile> {
  const credential = await signInWithPopup(auth, googleProvider);
  return ensureUserProfile(credential.user);
}

export async function signOutAccount(): Promise<void> {
  await signOut(auth);
}

export async function ensureUserProfile(fbUser: FirebaseUser): Promise<UserProfile> {
  const path = `users/${fbUser.uid}`;
  const userRef = doc(db, 'users', fbUser.uid);

  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (snap.exists()) {
    return mapDocToUserProfile(fbUser.uid, snap.data());
  }

  const email = (fbUser.email || '').trim().slice(0, 160);
  const rawName = (fbUser.displayName || email.split('@')[0] || 'Speed Athlete').trim().slice(0, 80);
  const baseHandle = email ? email.split('@')[0] : rawName;
  const username = sanitizeUsername(baseHandle, fbUser.uid.slice(0, 6));
  const avatarUrl =
    fbUser.photoURL && fbUser.photoURL.length <= 400
      ? fbUser.photoURL
      : generateRandomCartoonAvatar(username);

  const initialDoc = {
    uid: fbUser.uid,
    name: rawName || 'Speed Athlete',
    username,
    email,
    plan: 'free' as const,
    subscriptionStatus: 'none' as const,
    avatarUrl,
    streak: 0,
    longestStreak: 0,
    xp: 0,
    level: 1,
    bestWpm: 0,
    avgWpm: 0,
    testsCompleted: 0,
    themePreference: 'cosmic' as ThemeId,
    soundEnabled: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, initialDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  const lbPath = `leaderboard/${fbUser.uid}`;
  try {
    await setDoc(doc(db, 'leaderboard', fbUser.uid), {
      uid: fbUser.uid,
      username,
      name: initialDoc.name,
      avatarUrl,
      wpm: 0,
      accuracy: 0,
      consistency: 0,
      tests: 0,
      badge: 'Speed Athlete',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, lbPath);
  }

  return mapDocToUserProfile(fbUser.uid, initialDoc);
}

export async function fetchUserResults(uid: string): Promise<TestResult[]> {
  const path = `users/${uid}/results`;
  try {
    const q = query(
      collection(db, 'users', uid, 'results'),
      where('uid', '==', uid),
      limit(250)
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: data.id || d.id,
        wpm: Number(data.wpm || 0),
        rawWpm: Number(data.rawWpm || 0),
        accuracy: Number(data.accuracy || 0),
        consistency: Number(data.consistency || 0),
        correctChars: Number(data.correctChars || 0),
        incorrectChars: Number(data.incorrectChars || 0),
        errors: Number(data.errors || 0),
        totalEntries: Number(data.totalEntries || 0),
        wordsCompleted: Number(data.wordsCompleted || 0),
        timeTaken: Number(data.timeTaken || 0),
        targetDuration: Number(data.targetDuration || 0),
        mode: data.mode || 'classic',
        level: data.level || 'easy',
        date: data.date || new Date().toISOString(),
        timestamp: Number(data.timestamp || Date.now()),
        wpmPerSecond: Array.isArray(data.wpmPerSecond) ? data.wpmPerSecond : [],
        isPersonalBest: Boolean(data.isPersonalBest),
      } as TestResult;
    });

    items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function persistTestCompletion(
  uid: string,
  result: TestResult,
  updatedUser: UserProfile
): Promise<void> {
  const resultId = sanitizeId(result.id);
  const resultPath = `users/${uid}/results/${resultId}`;
  const cleanSeries = (Array.isArray(result.wpmPerSecond) ? result.wpmPerSecond : [])
    .slice(0, 600)
    .map((n) => clampNum(Number(n || 0), 0, 450));

  const resultPayload = {
    id: resultId,
    uid,
    wpm: clampNum(result.wpm, 0, 350),
    rawWpm: clampNum(result.rawWpm, 0, 450),
    accuracy: clampNum(result.accuracy, 0, 100),
    consistency: clampNum(result.consistency, 0, 100),
    correctChars: clampInt(result.correctChars, 0, 100000),
    incorrectChars: clampInt(result.incorrectChars, 0, 100000),
    errors: clampInt(result.errors, 0, 100000),
    totalEntries: clampInt(result.totalEntries, 0, 200000),
    wordsCompleted: clampInt(result.wordsCompleted, 0, 50000),
    timeTaken: clampNum(result.timeTaken, 0, 7200),
    targetDuration: clampNum(result.targetDuration, 0, 7200),
    mode: result.mode,
    level: result.level,
    date: String(result.date || new Date().toISOString()).slice(0, 64),
    timestamp: clampNum(result.timestamp || Date.now(), 1, 9999999999999),
    wpmPerSecond: cleanSeries,
    isPersonalBest: Boolean(result.isPersonalBest),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', uid, 'results', resultId), resultPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, resultPath);
  }

  await syncProfileAndLeaderboard(uid, updatedUser, {
    accuracy: clampNum(result.accuracy, 0, 100),
    consistency: clampNum(result.consistency, 0, 100),
  });
}

export async function syncProfileAndLeaderboard(
  uid: string,
  user: UserProfile,
  latestTelemetry?: { accuracy: number; consistency: number }
): Promise<void> {
  const cleanName = user.name.trim().slice(0, 80) || 'Speed Athlete';
  const cleanUsername = sanitizeUsername(user.username, uid.slice(0, 6));
  const cleanAvatar = (user.avatarUrl || generateRandomCartoonAvatar(cleanUsername)).slice(0, 400);
  const cleanTheme: ThemeId = VALID_THEMES.includes(user.themePreference)
    ? user.themePreference
    : 'cosmic';

  const bestWpm = clampInt(user.bestWpm, 0, 350);
  const avgWpm = clampInt(user.avgWpm, 0, 350);
  const testsCompleted = clampInt(user.testsCompleted, 0, 1000000);

  const userPath = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      name: cleanName,
      username: cleanUsername,
      avatarUrl: cleanAvatar,
      themePreference: cleanTheme,
      soundEnabled: Boolean(user.soundEnabled),
      streak: clampInt(user.streak, 0, 10000),
      longestStreak: clampInt(user.longestStreak, 0, 10000),
      xp: clampInt(user.xp, 0, 100000000),
      level: clampInt(user.level, 1, 10000),
      bestWpm,
      avgWpm,
      testsCompleted,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }

  const lbPath = `leaderboard/${uid}`;
  try {
    await setDoc(doc(db, 'leaderboard', uid), {
      uid,
      username: cleanUsername,
      name: cleanName,
      avatarUrl: cleanAvatar,
      wpm: bestWpm,
      accuracy: latestTelemetry ? clampNum(latestTelemetry.accuracy, 0, 100) : bestWpm > 0 ? 96 : 0,
      consistency: latestTelemetry ? clampNum(latestTelemetry.consistency, 0, 100) : bestWpm > 0 ? 90 : 0,
      tests: testsCompleted,
      badge: deriveBadgeFromWpm(bestWpm),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }
}

export function subscribeLeaderboard(
  onData: (entries: PublicLeaderboardEntry[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'leaderboard';
  const q = query(collection(db, 'leaderboard'), orderBy('wpm', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const entries: PublicLeaderboardEntry[] = snapshot.docs.map((d, idx) => {
        const data = d.data();
        return {
          rank: idx + 1,
          uid: data.uid || d.id,
          username: data.username || 'athlete',
          name: data.name || 'Speed Athlete',
          avatarUrl: data.avatarUrl || generateRandomCartoonAvatar(data.username || d.id),
          wpm: Number(data.wpm || 0),
          accuracy: Number(data.accuracy || 0),
          consistency: Number(data.consistency || 0),
          tests: Number(data.tests || 0),
          badge: data.badge || 'Speed Athlete',
        };
      });
      onData(entries);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function fetchAllAthletesForAdmin(): Promise<
  Array<{
    uid: string;
    name: string;
    username: string;
    email: string;
    plan: string;
    bestWpm: number;
    testsCompleted: number;
    createdAt: string;
  }>
> {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      let createdStr = 'Active';
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdStr = data.createdAt.toDate().toISOString().slice(0, 10);
      }
      return {
        uid: d.id,
        name: data.name || 'Speed Athlete',
        username: data.username || 'athlete',
        email: data.email || '',
        plan: data.plan || 'free',
        bestWpm: Number(data.bestWpm || 0),
        testsCompleted: Number(data.testsCompleted || 0),
        createdAt: createdStr,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
