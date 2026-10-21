# Pulsefit

An offline-first PWA sample: a workout and diet tracker with two roles, Coach and
Athlete, in one app. There is no backend; see `docs/brief.md` for the full scope.

## Run locally

Requirements: Node 24 (see `.nvmrc`) and pnpm.

```sh
pnpm install
pnpm dev        # dev server
pnpm build      # production build in dist/
pnpm preview    # serve the build on http://localhost:4173
```

## Checks

```sh
pnpm lint        # ESLint + Steiger (Feature-Sliced Design rules)
pnpm typecheck
pnpm test        # Vitest
pnpm test:e2e    # Playwright (builds and serves the app)
```

## Structure

Feature-Sliced Design: `src/app`, `src/pages`, `src/widgets`, `src/features`,
`src/entities`, `src/shared`. A layer may import only from the layers below it.
