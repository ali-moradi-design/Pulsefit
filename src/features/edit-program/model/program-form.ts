import { z } from 'zod'
import { saveRecord } from '@/shared/api'
import { postMessage, type Program } from '@/shared/db'
import { newId } from '@/shared/lib'

const itemSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.coerce.number().int().min(1, 'At least 1 set').max(10),
  reps: z.coerce.number().int().min(1, 'At least 1 rep').max(50),
  weightKg: z.coerce.number().min(0).max(500),
  restSec: z.coerce.number().int().min(0).max(600),
})

const daySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  title: z.string().trim().min(1, 'Give the day a name').max(40),
  items: z.array(itemSchema).min(1, 'Add at least one exercise'),
})

export const programSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(40),
  weeks: z.coerce.number().int().min(1).max(16),
  days: z.array(daySchema).min(1, 'Add at least one training day'),
  note: z.string().trim().max(280).optional(),
})

export type ProgramFormIn = z.input<typeof programSchema>
export type ProgramFormOut = z.output<typeof programSchema>

export const toForm = (p: Program): ProgramFormIn => ({
  name: p.name,
  weeks: p.weeks,
  days: [...p.days].sort((a, b) => a.weekday - b.weekday),
  note: '',
})

/** Saves the program for the athlete and tells open athlete tabs. */
export async function assignProgram(base: Program, v: ProgramFormOut) {
  const program: Program = {
    ...base,
    name: v.name,
    weeks: v.weeks,
    days: [...v.days].sort((a, b) => a.weekday - b.weekday),
    updatedAt: Date.now(),
  }
  await saveRecord('programs', program)
  postMessage({ type: 'program-assigned', programName: program.name })
  if (v.note) {
    const id = newId()
    await saveRecord('notes', { id, text: v.note, createdAt: Date.now() })
    postMessage({ type: 'note-sent', noteId: id, text: v.note })
  }
}
