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

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Profile = {
  name: string;
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

export type AppState = {
  profile: Profile;
  body: Body;
  goals: Goals;
  /** Steps per day, keyed by YYYY-MM-DD. */
  week: Record<string, number>;
  meals: Meal[];
  friends: Friend[];
};

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

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
  const sample = [12480, 8230, 10120, 675, 14310, 9450, 6240];
  // fix an obviously-wrong value (typo guard) then map onto real dates
  sample[3] = 6750;
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
      id: 'alex.carter',
      avatarUri: null,
    },
    body: {
      weightKg: 72,
      heightCm: 175,
    },
    goals: DEFAULT_GOALS,
    week: seedWeek(),
    meals: [
      { id: 'm1', name: 'Greek yogurt & berries', kcal: 320, protein: 24, carb: 38, fat: 8 },
      { id: 'm2', name: 'Chicken rice bowl', kcal: 640, protein: 46, carb: 72, fat: 16 },
      { id: 'm3', name: 'Protein shake', kcal: 180, protein: 30, carb: 6, fat: 3 },
      { id: 'm4', name: 'Almonds (handful)', kcal: 170, protein: 6, carb: 6, fat: 15 },
    ],
    friends: [
      { id: 'f1', name: 'Jordan Lee', avatarUri: null, lastMessage: 'See you at the gym at 6?' },
      { id: 'f2', name: 'Sam Rivera', avatarUri: null, lastMessage: 'New PR today 💪' },
      { id: 'f3', name: 'Priya Nair', avatarUri: null, lastMessage: 'Sent you a workout plan' },
      { id: 'f4', name: 'Chris Obi', avatarUri: null, lastMessage: 'Thanks for the tips!' },
    ],
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
  caloriesBurned: number;
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

  // Stride length (m) ≈ height(cm) * 0.415 / 100. Distance in km.
  const strideM = (state.body.heightCm * 0.415) / 100;
  const distanceKm = (todaySteps * strideM) / 1000;

  // Rough walking burn: ~0.045 kcal per step for a 70 kg person, scaled by weight.
  const caloriesBurned = todaySteps * 0.045 * (state.body.weightKg / 70);

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
    caloriesBurned,
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
  setId: (id: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setBody: (patch: Partial<Body>) => void;
  setDaySteps: (key: string, steps: number) => void;
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  removeMeal: (id: string) => void;
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
          setState((prev) => ({
            ...prev,
            ...parsed,
            profile: { ...prev.profile, ...parsed.profile },
            body: { ...prev.body, ...parsed.body },
            goals: { ...prev.goals, ...parsed.goals },
            week: { ...prev.week, ...parsed.week },
            meals: parsed.meals ?? prev.meals,
            friends: parsed.friends ?? prev.friends,
          }));
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

  const setId = useCallback((id: string) => {
    setState((s) => ({ ...s, profile: { ...s.profile, id } }));
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
      setId,
      setAvatarUri,
      setBody,
      setDaySteps,
      addMeal,
      removeMeal,
      resetAll,
    }),
    [ready, state, derived, setName, setId, setAvatarUri, setBody, setDaySteps, addMeal, removeMeal, resetAll],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}
