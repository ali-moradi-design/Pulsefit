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

Use graphify to save tokens once the repo has code:

- After the first scaffold, build the graph from code only
  (`/graphify .`, skip `docs/mockups/`, `node_modules/`, `dist/`).
- For questions about structure ("where is X", "what imports Y", which FSD
  layer owns Z) run `graphify query "<question>"` before reading files, then
  read only the files it points to.
- After each merged PR, refresh with `/graphify . --update` (changed files only).
- `graphify-out/` is not committed.

## Language

- Explain in Persian (Farsi). Every English term goes inside parentheses and
  backticks; never start a line, bullet or paragraph with an English word; put
  a RIGHT-TO-LEFT MARK (U+200F) at the start of every bullet and after every
  English term. The user's messages have typos; never copy the spelling.
- Files in this repo are written in English.
