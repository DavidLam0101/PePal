# PePal

A React Native (Expo Router, SDK 57) fitness app with a round floating bottom
navigation bar and five sections: **Home, Workout, Nutrition, Social, Profile**.

## Run it

```bash
npm install
npx expo start
```

Then press `w` for web, `a` for Android, `i` for iOS, or scan the QR code with
Expo Go.

## What's in it

| Screen | Contents |
| --- | --- |
| **Home** (`src/app/index.tsx`) | Step ring vs a 10,000 goal (shows how far over/under), estimated distance walked and calories burned, and a 7‑day breakdown with a percentage bar per day and a green ✓ "Yes" on days that hit 10,000. |
| **Workout** (`src/app/workout.tsx`) | Three large buttons — Create plan, Generate workout, Start empty workout (placeholder actions for now). |
| **Nutrition** (`src/app/nutrition.tsx`) | Calorie tracker ring (consumed vs goal), protein / carb / fat rings, the day's meal list, and Add meal / Scan meal buttons (placeholders). |
| **Social** (`src/app/social.tsx`) | Chat / Social toggle. Chat has an Add friend button and a friends list; Social is an empty placeholder. |
| **Profile** (`src/app/profile.tsx`) | Editable name, ID, and profile photo (photo is a placeholder); Personal information → Body with editable weight and height that feed the Home estimates. |

## How data works

- **Steps** come from the device pedometer via `expo-sensors`
  (`src/hooks/use-pedometer.ts`). iOS backfills the last 7 days from Core Motion
  history; Android tracks today's count live. On web / simulator / when
  permission is denied, a seeded sample week is shown so every screen has data.
- **Everything else** (profile, body stats, meals, friends, step history) lives
  in a React context store (`src/store/app-data.tsx`) and is persisted with
  `@react-native-async-storage/async-storage`, so edits survive an app restart.

## Project layout

```
src/
  app/            expo-router screens + _layout.tsx (Tabs + custom tab bar)
  components/      floating-tab-bar, progress-ring, screen, ui (cards/buttons/modal)
  constants/      theme.ts (light + dark palette, spacing, radii)
  hooks/          use-pedometer.ts
  store/          app-data.tsx (context, persistence, derived selectors)
  utils/          format.ts
```
