# Project instructions

Pulsefit: an offline-first PWA sample (workout and diet tracker, Coach and
Athlete roles, no backend). The full brief is in `docs/brief.md`; read it at the
start of every session. Mockups are in `docs/mockups/` (source in
`docs/mockups/src/mockups.html`).

## Fixed choices

- Runtime: Node 24 LTS (`.nvmrc`), package manager pnpm only (no npm/yarn lockfiles).
- Architecture: Feature-Sliced Design (`app`, `pages`, `widgets`, `features`,
  `entities`, `shared`); imports only go downward; each slice exposes a public
  `index.ts`. Steiger checks the rules in CI.
- TypeScript 6 (not 7: typescript-eslint does not support TS 7 yet).
- Charts: uPlot. Fonts: Sora (headings, numbers) and Figtree (body), self-hosted
  with Fontsource so they work offline.
- Themes: light (coral on light grey), dark (mint on navy), neon (cyan, lime,
  magenta on near-black). Tokens live in `src/app/styles/index.css`.
- Roles come from the URL (`/athlete/*`, `/coach/*`), so two tabs can show
  both roles at once.
- Work in small PRs: branch → PR → CI → squash merge. Explain each step.
- Keep it a simple sample app: no features outside the brief without asking.

## graphify

Use graphify to save tokens; the code graph needs no LLM:

- Build or refresh: `graphify update .` (AST only, a few seconds). Run it at the
  start of a session if `graphify-out/` is missing, and after each merged PR.
- For structure questions ("where is X", "what calls Y", which FSD layer owns Z)
  run `graphify query "<question>" --budget 800` (or `graphify explain "Symbol"`)
  before opening files, then read only the files it points to.
- Do not run the full `/graphify` pipeline (LLM extraction) unless asked; the docs
  are few and short.
- `graphify-out/` is git-ignored.

## Where things are

- Service worker: `src/app/sw/` (`sw.ts` routes and events, `mock-server.ts`,
  `outbox.ts` flush, `actions.ts` notification buttons).
- Data: `src/shared/db` (worker-safe Dexie, channel, reminder check) and
  `src/shared/api` (outbox writes, sync triggers, seed).
- E2E helpers in `e2e/helpers.ts`; the update test runs in its own Playwright
  project because it edits `dist/sw.js`.

## Language

- Explain in Persian (Farsi). Every English term goes inside parentheses and
  backticks; never start a line, bullet or paragraph with an English word; put
  a RIGHT-TO-LEFT MARK (U+200F) at the start of every bullet and after every
  English term. The user's messages have typos; never copy the spelling.
- Files in this repo are written in English.
