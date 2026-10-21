import { useLiveQuery } from 'dexie-react-hooks'
import { saveRecord } from '@/shared/api'
import { db, type Note } from '@/shared/db'

export function useNotes(): Note[] {
  return useLiveQuery(() => db.notes.orderBy('createdAt').reverse().toArray(), [], [])
}

export function useUnreadCount(): number {
  return useLiveQuery(() => db.notes.filter((n) => !n.readAt).count(), [], 0)
}

export const markRead = (note: Note) => saveRecord('notes', { ...note, readAt: Date.now() })
