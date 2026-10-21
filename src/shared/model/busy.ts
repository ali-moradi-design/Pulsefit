import { create } from 'zustand'

// True while something must not be interrupted (an active workout).
type BusyState = { workoutActive: boolean; setWorkoutActive: (active: boolean) => void }

export const useBusy = create<BusyState>()((set) => ({
  workoutActive: false,
  setWorkoutActive: (workoutActive) => set({ workoutActive }),
}))
