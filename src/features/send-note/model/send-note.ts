import { z } from 'zod'
import { saveRecord } from '@/shared/api'
import { postMessage } from '@/shared/db'
import { newId } from '@/shared/lib'

export const noteSchema = z.object({
  text: z.string().trim().min(2, 'Write a short note').max(280),
})

export async function sendNote(text: string) {
  const id = newId()
  await saveRecord('notes', { id, text, createdAt: Date.now() })
  postMessage({ type: 'note-sent', noteId: id, text })
}
