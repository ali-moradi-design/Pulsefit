# Pulsefit

An offline-first PWA sample: a workout and diet tracker with two roles, Coach and
Athlete, in one app. Built with Vite, React 19, TypeScript, Dexie and Workbox.

> **The server is simulated.** There is no backend. A mock API runs inside the
> service worker with its own IndexedDB database, so the offline queue, Background
> Sync and network-first caching really run and can be watched on the
> **PWA status** page (the ⓘ icon).

## Try it

1. Open the app, then open a second tab and switch it to **Coach**.
2. In the coach tab, change the program or send a note. The athlete tab shows a
   live toast and, if notifications are allowed, a system notification.
3. Go offline (DevTools → Network → Offline) and log a set, a meal or your weight.
   The status chip shows the queued changes; going back online syncs them.
4. Install the app (install banner, or Share → Add to Home Screen on iOS). The
   home screen icon has a **Start workout** shortcut.

Demo barcodes for the diet scanner (or type them in): every food in
`public/data/foods.json` has one, for example `2000000000015` (egg). They are in
the in-store 200 range, not real products.

## PWA capabilities

| Capability                                               | Where it is used                                                                          | Fallback                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Install (manifest, maskable icon, screenshots, shortcut) | Install banner, "Start workout" shortcut                                                  | iOS: Share → Add to Home Screen hint                          |
| Precached app shell, offline page                        | Every route works offline after the first visit                                           | –                                                             |
| Cache first                                              | Images and fonts                                                                          | –                                                             |
| Stale-while-revalidate                                   | Exercise and food libraries (`/data/*.json`)                                              | –                                                             |
| Network first + cache                                    | Mock API (`/api/*`)                                                                       | Last cached answer                                            |
| IndexedDB (Dexie) + outbox                               | All data; every write is queued in the same transaction                                   | –                                                             |
| Background Sync                                          | Sends the outbox when the browser is online, even after the tab closes                    | Safari, Firefox: flush on app start and on the `online` event |
| Periodic Background Sync                                 | Refreshes libraries and program, shows the reminder (installed app, Chromium)             | Reminder checks while the app is open                         |
| Local notifications with actions                         | Coach notes ("Mark as read"), rest timer, workout reminder ("Start workout", "Mark done") | In-app toasts                                                 |
| Update prompt                                            | "New version available"; the new worker waits for the user and never interrupts a workout | –                                                             |
| Wake Lock                                                | Screen stays on during a workout                                                          | –                                                             |
| Vibration + Web Audio                                    | Rest timer finished                                                                       | –                                                             |
| Badging                                                  | Unread coach notes on the app icon                                                        | –                                                             |
| `BarcodeDetector` + camera                               | Scan food barcodes                                                                        | Type the code                                                 |
| `BroadcastChannel`                                       | Coach tab → athlete tab, live                                                             | –                                                             |
| `navigator.storage.persist()`                            | Asked on the first workout, or from the status page                                       | –                                                             |

Every capability is feature-detected; the **PWA status** page lists what the
current browser supports.

**Out of scope:** Web Push (notifications while the app is fully closed) needs a
push server, so this demo uses local notifications and scheduled reminders
instead.

Lighthouse no longer has a PWA category; installability and offline behaviour
are checked by the Playwright tests and in Chrome DevTools (Application panel).

## Run locally

Requirements: Node 24 (see `.nvmrc`) and pnpm.

```sh
pnpm install
pnpm dev        # dev server (no service worker)
pnpm build      # production build in dist/
pnpm preview    # serve the build on http://localhost:4173 (with the service worker)
```

## Checks

```sh
pnpm lint        # ESLint + Steiger (Feature-Sliced Design rules)
pnpm typecheck
pnpm test        # Vitest
pnpm test:e2e    # Playwright: offline, outbox sync, notifications, update prompt, axe
```

CI (GitHub Actions) runs all of them on every pull request.

## Structure

Feature-Sliced Design. A layer imports only from the layers below it.

```
src/
  app/        router, theme sync, service worker (src/app/sw: caching, mock API, sync)
  pages/      one slice per screen
  widgets/    app shell, nutrition summary
  features/   user actions: workout session, log meal, scan barcode, edit program, ...
  entities/   library, training, nutrition, body, note
  shared/     db (worker-safe Dexie, channel), api (outbox, seed), lib, ui, config
```

## Data and assets

- Food values per 100 g are based on USDA FoodData Central (public domain), rounded.
- Exercise library, icons and screenshots are made for this project
  (`scripts/generate-assets.mjs`, `scripts/capture-screenshots.mjs`).
- Fonts: Sora and Figtree (SIL Open Font License), self-hosted with Fontsource.
