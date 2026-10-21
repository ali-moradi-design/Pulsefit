// Worker-safe part of the data layer: no DOM APIs, so the service worker can import it.
export { db, PulsefitDb } from './db'
export { postMessage, subscribe, type ChannelMessage } from './channel'
export { SYNC_TAG } from './sync-tag'
export type * from './types'
