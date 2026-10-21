# Pulsefit: brief

Decisions from 2026-10-21. Demo 11 in notes/demos.md (PWA: workout and diet
tracker). Built in the public repo `ali-moradi-design/pulsefit` (created by the
user) in its own sessions; this file is the handoff and is safe to make public.

## Decisions

- Name and brand: Pulsefit (new). Repo `pulsefit`, public; subdomain
  `pulsefit.ali-moradi-develop.com`.
- No backend: a static, offline-first sample app (roadmap phase 7 deploy).
- Two parts in one app: Coach and Athlete, switched with a role toggle.
- English only.
- Themes: light, dark and neon.
- Keep it a simple sample app: every feature exists to show a PWA capability or
  the coach/athlete flow; no extras without asking the user.

## How the two parts work without a backend

- Data lives in IndexedDB (Dexie), shared by both roles in the same browser.
- Coach and Athlete open in two tabs talk live through `BroadcastChannel`
  (for example the coach sends a program and the athlete tab shows a notification
  through the service worker).
- A mock API inside the service worker stands in for a server, so the offline
  queue (outbox) and Background Sync really run and can be seen in the demo.
  The README states clearly that the server is simulated.
- Real Web Push (notifications while the app is fully closed) needs a push server,
  so it is out of scope; local notifications and scheduled reminders replace it.
  The README says so.

## Features (minimal)

Athlete (the PWA focus)

- Today's workout player: log sets, reps and weight; rest timer with vibration
  and sound; the screen stays on during a workout (Wake Lock).
- Diet: today's meal plan, log meals with calories and macros; barcode scan with
  the camera (`BarcodeDetector`, where supported) against a small bundled food list.
- Progress: body weight and measurements, simple charts, personal records, streak.
- Everything works offline and syncs (to the mock API) when back online.

Coach

- Exercise and food libraries (small seed data with free assets: simple
  illustrations or CC0 images; food data from a public-domain source such as
  USDA FoodData Central, trimmed).
- Build a training program and a meal plan, assign to the athlete, send a note.
- See the athlete's logged workouts and progress.

## PWA capabilities (each with a real use)

- Install: full manifest (icons incl. maskable, screenshots for the richer install
  dialog, shortcut "Start workout"); custom install button; iOS install hint.
- Caching (Workbox via vite-plugin-pwa): precache the app shell; cache-first for
  images and fonts; stale-while-revalidate for the exercise and food libraries;
  network-first for the mock API with cache fallback; offline fallback page.
- Offline data: IndexedDB with an outbox of unsent changes.
- Sync: Background Sync for the outbox; fallback for browsers without it
  (Safari, Firefox): flush on app start and on the `online` event. Periodic
  Background Sync (Chromium) to refresh the program, behind feature detection.
- Notifications: local notifications via the service worker, with an action
  button ("Mark done"); scheduled workout reminders while the app is open or in
  the background where allowed.
- Updates: "New version available" prompt; the new service worker activates only
  when the user agrees (never in the middle of a workout).
- Device APIs: Wake Lock, Vibration, Badging (unread coach notes),
  `navigator.storage.persist()` so the browser keeps the data.
- Every capability is feature-detected and degrades gracefully; a small
  "PWA status" page shows which capabilities this browser supports.

## UI

- Mobile-first (it is a phone app), works on desktop too.
- Light, dark and neon themes as semantic tokens. Neon: near-black background,
  glowing accents (for example cyan, magenta, lime) with soft glow on buttons,
  charts and the timer; text contrast stays WCAG AA; glows and motion are reduced
  under `prefers-reduced-motion`.
- Mockups first as images (HTML/CSS rendered to PNG with Playwright): athlete
  today screen, workout player, diet log, coach program builder, in all three
  themes. No UI code before the user approves.

## Stack (proposal; confirm at session start)

- Vite + React 19 + TypeScript (strict), React Router.
- vite-plugin-pwa (Workbox), Dexie (IndexedDB), Zustand for small UI state.
- React Hook Form + Zod for the coach forms.
- Tailwind CSS v4; charts with a light library (for example Recharts or uPlot).
- FSD structure; ESLint + Prettier (+ Steiger for FSD rules).
- Tests: Vitest; Playwright E2E including offline (`context.setOffline`), service
  worker caching, outbox sync after reconnect, and the update prompt; axe checks.
- CI on GitHub Actions; required check on `main`.
- Note: Lighthouse no longer has a PWA category; verify installability and
  offline behaviour with the E2E tests and Chrome DevTools instead.

## How the build session starts

1. Check prerequisites: `git`, `node` (LTS), `pnpm`; the folder is a clone of
   `pulsefit`, clean; GitHub access; Playwright runs.
2. Copy this brief into the repo as `docs/brief.md` WITHOUT the "Background"
   section.
3. Mockups for approval (see UI).
4. Split into versions with the user; build step by step in small PRs (branch →
   PR → CI → squash merge), explaining each step.

Language rules: explain in Persian, every English term inside parentheses and
backticks, never start a line with an English word, repo files in English.
