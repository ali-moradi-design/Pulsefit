import { create } from 'zustand'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallState = {
  promptEvent: BeforeInstallPromptEvent | null
  installed: boolean
  install: () => Promise<void>
}

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

// iOS Safari has no install prompt; the user adds the app from the Share menu.
export const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const useInstall = create<InstallState>()((set, get) => ({
  promptEvent: null,
  installed: false,
  install: async () => {
    const event = get().promptEvent
    if (!event) return
    await event.prompt()
    const { outcome } = await event.userChoice
    set({ promptEvent: null, installed: outcome === 'accepted' })
  },
}))

export function initInstall() {
  useInstall.setState({ installed: isStandalone() })
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    useInstall.setState({ promptEvent: e as BeforeInstallPromptEvent })
  })
  window.addEventListener('appinstalled', () =>
    useInstall.setState({ promptEvent: null, installed: true }),
  )
}
