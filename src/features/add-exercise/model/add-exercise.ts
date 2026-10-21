import { z } from 'zod'
import { db } from '@/shared/db'

export const exerciseSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(40),
  muscle: z.enum(['chest', 'back', 'shoulders', 'legs', 'arms', 'core']),
  equipment: z.string().trim().min(2, 'Equipment is required').max(20),
  cue: z.string().trim().max(120),
})

export type ExerciseForm = z.infer<typeof exerciseSchema>

/** Custom exercises live only in this browser; the bundled library refreshes around them. */
export const addExercise = (v: ExerciseForm) =>
  db.exercises.put({ id: `custom-${crypto.randomUUID()}`, ...v })
