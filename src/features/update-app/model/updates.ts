import { registerSW } from 'virtual:pwa-register'
import { create } from 'zustand'

type UpdateState = {
  needRefresh: boolean
  offlineReady: boolean
  dismissed: boolean
  update: () => Promise<void>
  dismiss: () => void
}

export const useUpdates = create<UpdateState>()((set) => ({
  needRefresh: false,
  offlineReady: false,
  dismissed: false,
  update: async () => {},
  dismiss: () => set({ dismissed: true }),
}))

export function initUpdates() {
  if (!('serviceWorker' in navigator)) return
  const updateSW = registerSW({
    onNeedRefresh: () => useUpdates.setState({ needRefresh: true, dismissed: false }),
    onOfflineReady: () => useUpdates.setState({ offlineReady: true }),
  })
  // Activates the waiting worker and reloads the page.
  useUpdates.setState({ update: () => updateSW(true) })
}
