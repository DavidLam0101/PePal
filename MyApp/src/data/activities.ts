/**
 * Activities that can be logged on Home.
 * `met` is the Compendium of Physical Activities MET value (≈ kcal per kg per hour).
 * Walking is intentionally absent: steps already cover it.
 */
export type ActivityType = {
  id: string;
  name: string;
  icon: 'bicycle-outline' | 'barbell-outline' | 'water-outline' | 'flash-outline' | 'body-outline' | 'fitness-outline';
  met: number;
};

export const ACTIVITY_TYPES: ActivityType[] = [
  { id: 'running', name: 'Running', icon: 'fitness-outline', met: 9.8 },
  { id: 'cycling', name: 'Cycling', icon: 'bicycle-outline', met: 7.5 },
  { id: 'swimming', name: 'Swimming', icon: 'water-outline', met: 7.0 },
  { id: 'weights', name: 'Weight training', icon: 'barbell-outline', met: 5.0 },
  { id: 'hiit', name: 'HIIT', icon: 'flash-outline', met: 8.0 },
  { id: 'yoga', name: 'Yoga', icon: 'body-outline', met: 2.5 },
];

export function findActivityType(id: string): ActivityType | undefined {
  return ACTIVITY_TYPES.find((a) => a.id === id);
}
