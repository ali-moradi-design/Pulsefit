import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // A small app has many features used by a single page; keeping them as
    // separate slices still keeps each user action in one place.
    rules: { 'fsd/insignificant-slice': 'off' },
  },
])
