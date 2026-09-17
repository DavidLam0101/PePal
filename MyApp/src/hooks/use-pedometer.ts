import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { AppState as RNAppState, Platform } from 'react-native';

import { dateKey, lastSevenDays, useAppData } from '@/store/app-data';

export type PedometerStatus = 'checking' | 'live' | 'unavailable' | 'denied';

/**
 * Wires the device pedometer into the app store.
 *
 * - iOS: queries the trailing 7 days via `getStepCountAsync` and keeps today's
 *   count live with `watchStepCount`.
 * - Android: no historical query exists, so previously stored per-day values are
 *   kept and today's count is tracked live from subscription time.
 * - Web / simulator / permission denied: leaves the seeded mock week in place so
 *   every screen still has data to show.
 */
export function usePedometer(): { status: PedometerStatus } {
  const { setDaySteps, state } = useAppData();
  const [status, setStatus] = useState<PedometerStatus>('checking');

  // Steps already on record for today before the live subscription started.
  const baselineRef = useRef<number>(0);
  const todayKeyRef = useRef<string>(dateKey(new Date()));

  useEffect(() => {
    baselineRef.current = state.week[todayKeyRef.current] ?? 0;
    // Only read the baseline once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    let watch: { remove: () => void } | null = null;

    async function start() {
      if (Platform.OS === 'web') {
        if (!cancelled) setStatus('unavailable');
        return;
      }
      // Drop any previous live subscription before re-syncing.
      watch?.remove();
      watch = null;

      let available = false;
      try {
        available = await Pedometer.isAvailableAsync();
      } catch {
        available = false;
      }
      if (cancelled) return;
      if (!available) {
        setStatus('unavailable');
        return;
      }

      try {
        const perm = await Pedometer.requestPermissionsAsync();
        if (cancelled) return;
        if (!perm.granted) {
          setStatus('denied');
          return;
        }
      } catch {
        // Some platforms resolve permissions implicitly; continue.
      }

      // iOS: backfill the last 7 days from Core Motion history.
      if (Platform.OS === 'ios') {
        const days = lastSevenDays();
        await Promise.all(
          days.map(async (day) => {
            const start = new Date(day);
            start.setHours(0, 0, 0, 0);
            const end = new Date(day);
            end.setHours(23, 59, 59, 999);
            try {
              const { steps } = await Pedometer.getStepCountAsync(start, end);
              if (!cancelled && typeof steps === 'number' && steps >= 0) {
                setDaySteps(dateKey(day), steps);
                if (dateKey(day) === todayKeyRef.current) {
                  baselineRef.current = steps;
                }
              }
            } catch {
              // ignore individual day failures
            }
          }),
        );
      }

      if (cancelled) return;
      setStatus('live');

      // Live updates for today. `watchStepCount` reports steps since subscription,
      // so add them to whatever was already on record for today.
      watch = Pedometer.watchStepCount(({ steps }) => {
        const key = dateKey(new Date());
        if (key !== todayKeyRef.current) {
          // Day rolled over while the app was open.
          todayKeyRef.current = key;
          baselineRef.current = 0;
        }
        setDaySteps(key, baselineRef.current + steps);
      });
    }

    start();

    const sub = RNAppState.addEventListener('change', (next) => {
      if (next === 'active') {
        // Re-sync on foreground (picks up background steps on iOS history).
        start();
      }
    });

    return () => {
      cancelled = true;
      watch?.remove();
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status };
}
