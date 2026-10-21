import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Exercise, type Food } from '@/shared/db'

export function useExercises(): Exercise[] {
  return useLiveQuery(() => db.exercises.orderBy('muscle').toArray(), [], [])
}

export function useExerciseMap(): Map<string, Exercise> {
  const list = useExercises()
  return new Map(list.map((e) => [e.id, e]))
}

export function useFoods(): Food[] {
  return useLiveQuery(
    () => db.foods.toArray().then((f) => f.sort((a, b) => a.name.localeCompare(b.name))),
    [],
    [],
  )
}

export function useFoodMap(): Map<string, Food> {
  const list = useFoods()
  return new Map(list.map((f) => [f.id, f]))
}

export const findFoodByBarcode = (barcode: string) =>
  db.foods.where('barcode').equals(barcode).first()
