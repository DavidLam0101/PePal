import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { findActivityType } from '@/data/activities';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Profile = {
  name: string;
  /** 11-digit ID. Generated once and never editable. */
  id: string;
  avatarUri: string | null;
};

export type Body = {
  weightKg: number;
  heightCm: number;
};

export type Goals = {
  stepGoal: number;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
};

export type Meal = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
};

export type Friend = {
  id: string;
  name: string;
  avatarUri: string | null;
  lastMessage: string;
};

export type Activity = {
  id: string;
  /** Matches an `ACTIVITY_TYPES` id. */
  typeId: string;
  minutes: number;
  /** YYYY-MM-DD the activity was logged on. */
  date: string;
};

export type AppState = {
  profile: Profile;
  body: Body;
  goals: Goals;
  /** Steps per day, keyed by YYYY-MM-DD. */
  week: Record<string, number>;
  meals: Meal[];
  friends: Friend[];
  activities: Activity[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const ID_PATTERN = /^\d{11}$/;

/** Random 11-digit ID; first digit is never 0 so it always has 11 digits. */
export function generateId11(): string {
  let id = `${1 + Math.floor(Math.random() * 9)}`;
  for (let i = 0; i < 10; i++) id += `${Math.floor(Math.random() * 10)}`;
  return id;
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Last 7 calendar days, oldest first, ending today. */
export function lastSevenDays(now = new Date()): Date[] {
  const out: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_GOALS: Goals = {
  stepGoal: 10000,
  calorieGoal: 2200,
  proteinGoal: 140,
  carbGoal: 250,
  fatGoal: 70,
};

function seedWeek(): Record<string, number> {
  // Plausible history: a few days over goal, a few under, today partial.
  const sample = [12480, 8230, 10120, 6750, 14310, 9450, 6240];
  const days = lastSevenDays();
  const week: Record<string, number> = {};
  days.forEach((d, i) => {
    week[dateKey(d)] = sample[i];
  });
  return week;
}

function seedState(): AppState {
  return {
    profile: {
      name: 'Alex Carter',
      id: generateId11(),
      avatarUri: null,
    },
    body: {
      weightKg: 72,
      heightCm: 175,
    },
    goals: DEFAULT_GOALS,
    week: seedWeek(),
    meals: [],
    friends: [],
    activities: [],
  };
}

/* ------------------------------------------------------------------ */
/* Derived selectors                                                   */
/* ------------------------------------------------------------------ */

export type WeekDay = {
  key: string;
  date: Date;
  label: string;
  steps: number;
  pct: number;
  hit: boolean;
};

export type Derived = {
  todayKey: string;
  todaySteps: number;
  stepsOverGoal: number;
  stepGoalPct: number;
  distanceKm: number;
  /** Walking energy from distance: ≈ 0.5 kcal per kg per km. */
  stepKcal: number;
  /** Sum of MET × weight × hours for today's logged activities. */
  activityKcal: number;
  totalKcal: number;
  todayActivities: Activity[];
  weekDays: WeekDay[];
  daysHitThisWeek: number;
  consumedKcal: number;
  consumedProtein: number;
  consumedCarb: number;
  consumedFat: number;
};

function deriveFrom(state: AppState): Derived {
  const todayKey = dateKey(new Date());
  const todaySteps = state.week[todayKey] ?? 0;
  const { stepGoal } = state.goals;

  // Stride length (m) ≈ height(cm) × 0.415 / 100. Distance in km.
  const strideM = (state.body.heightCm * 0.415) / 100;
  const distanceKm = (todaySteps * strideM) / 1000;

  const stepKcal = 0.5 * state.body.weightKg * distanceKm;

  const todayActivities = state.activities.filter((a) => a.date === todayKey);
  const activityKcal = todayActivities.reduce((sum, a) => {
    const met = findActivityType(a.typeId)?.met ?? 0;
    return sum + met * state.body.weightKg * (a.minutes / 60);
  }, 0);

  const weekDays: WeekDay[] = lastSevenDays().map((date) => {
    const key = dateKey(date);
    const steps = state.week[key] ?? 0;
    const pct = stepGoal > 0 ? Math.min(100, Math.round((steps / stepGoal) * 100)) : 0;
    return {
      key,
      date,
      label: WEEKDAY_LABELS[date.getDay()],
      steps,
      pct,
      hit: steps >= stepGoal,
    };
  });

  const consumedKcal = state.meals.reduce((s, m) => s + m.kcal, 0);
  const consumedProtein = state.meals.reduce((s, m) => s + m.protein, 0);
  const consumedCarb = state.meals.reduce((s, m) => s + m.carb, 0);
  const consumedFat = state.meals.reduce((s, m) => s + m.fat, 0);

  return {
    todayKey,
    todaySteps,
    stepsOverGoal: todaySteps - stepGoal,
    stepGoalPct: stepGoal > 0 ? Math.min(100, Math.round((todaySteps / stepGoal) * 100)) : 0,
    distanceKm,
    stepKcal,
    activityKcal,
    totalKcal: stepKcal + activityKcal,
    todayActivities,
    weekDays,
    daysHitThisWeek: weekDays.filter((d) => d.hit).length,
    consumedKcal,
    consumedProtein,
    consumedCarb,
    consumedFat,
  };
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type AppDataContextValue = {
  ready: boolean;
  state: AppState;
  derived: Derived;
  setName: (name: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setBody: (patch: Partial<Body>) => void;
  setDaySteps: (key: string, steps: number) => void;
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  removeMeal: (id: string) => void;
  /** Returns false if the user is already a friend or tries to add themself. */
  addFriend: (user: { id: string; name: string; avatarUri: string | null }) => boolean;
  clearFriends: () => void;
  addActivity: (typeId: string, minutes: number) => void;
  removeActivity: (id: string) => void;
  resetAll: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const STORAGE_KEY = 'pepal:v1';

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState());
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  // Load persisted state once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState((prev) => {
            const storedId = parsed.profile?.id;
            // Migrate older IDs (e.g. "alex.carter") to a valid 11-digit ID.
            const id = storedId && ID_PATTERN.test(storedId) ? storedId : generateId11();
            return {
              ...prev,
              ...parsed,
              profile: { ...prev.profile, ...parsed.profile, id },
              body: { ...prev.body, ...parsed.body },
              goals: { ...prev.goals, ...parsed.goals },
              week: { ...prev.week, ...parsed.week },
              meals: parsed.meals ?? prev.meals,
              friends: parsed.friends ?? prev.friends,
              activities: parsed.activities ?? prev.activities,
            };
          });
        }
      } catch {
        // ignore corrupt storage, fall back to seed
      } finally {
        if (!cancelled) {
          hydrated.current = true;
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const setName = useCallback((name: string) => {
    setState((s) => ({ ...s, profile: { ...s.profile, name } }));
  }, []);

  const setAvatarUri = useCallback((avatarUri: string | null) => {
    setState((s) => ({ ...s, profile: { ...s.profile, avatarUri } }));
  }, []);

  const setBody = useCallback((patch: Partial<Body>) => {
    setState((s) => ({ ...s, body: { ...s.body, ...patch } }));
  }, []);

  const setDaySteps = useCallback((key: string, steps: number) => {
    setState((s) => {
      if (s.week[key] === steps) return s;
      return { ...s, week: { ...s.week, [key]: steps } };
    });
  }, []);

  const addMeal = useCallback((meal: Omit<Meal, 'id'>) => {
    setState((s) => ({
      ...s,
      meals: [...s.meals, { ...meal, id: `m${Date.now()}` }],
    }));
  }, []);

  const removeMeal = useCallback((id: string) => {
    setState((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) }));
  }, []);

  const addFriend = useCallback<AppDataContextValue['addFriend']>(
    (user) => {
      // Check against the current snapshot synchronously so the caller gets an answer.
      if (user.id === state.profile.id) return false;
      if (state.friends.some((f) => f.id === user.id)) return false;
      setState((s) => ({
        ...s,
        friends: [
          ...s.friends,
          { id: user.id, name: user.name, avatarUri: user.avatarUri, lastMessage: 'Say hi 👋' },
        ],
      }));
      return true;
    },
    [state.profile.id, state.friends],
  );

  const clearFriends = useCallback(() => {
    setState((s) => ({ ...s, friends: [] }));
  }, []);

  const addActivity = useCallback((typeId: string, minutes: number) => {
    setState((s) => ({
      ...s,
      activities: [
        ...s.activities,
        { id: `a${Date.now()}`, typeId, minutes, date: dateKey(new Date()) },
      ],
    }));
  }, []);

  const removeActivity = useCallback((id: string) => {
    setState((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== id) }));
  }, []);

  const resetAll = useCallback(() => {
    setState(seedState());
  }, []);

  const derived = useMemo(() => deriveFrom(state), [state]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      state,
      derived,
      setName,
      setAvatarUri,
      setBody,
      setDaySteps,
      addMeal,
      removeMeal,
      addFriend,
      clearFriends,
      addActivity,
      removeActivity,
      resetAll,
    }),
    [
      ready,
      state,
      derived,
      setName,
      setAvatarUri,
      setBody,
      setDaySteps,
      addMeal,
      removeMeal,
      addFriend,
      clearFriends,
      addActivity,
      removeActivity,
      resetAll,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}
