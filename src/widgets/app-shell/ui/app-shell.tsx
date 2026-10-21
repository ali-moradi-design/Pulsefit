import { Link, Outlet, useLocation } from 'react-router'
import { InstallBanner } from '@/features/install-app'
import { LiveToasts } from '@/features/live-updates'
import { ThemeCycleButton } from '@/features/switch-theme'
import { UpdatePrompt } from '@/features/update-app'
import { useReminderScheduler } from '@/features/workout-reminder'
import { useUnreadCount } from '@/entities/note'
import { setBadge } from '@/shared/lib'
import { useEffect } from 'react'
import { routes, type Role } from '@/shared/config'
import { Icon } from '@/shared/ui'
import { BottomNav } from './bottom-nav'
import { RoleSwitcher } from './role-switcher'

export function AppShell() {
  const { pathname } = useLocation()
  const role: Role = pathname.startsWith('/coach') ? 'coach' : 'athlete'
  const unread = useUnreadCount()
  useReminderScheduler()
  // App icon badge: unread coach notes.
  useEffect(() => setBadge(unread), [unread])
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between gap-2 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <Link
          to={routes.athlete.today}
          className="flex items-center gap-1.5 font-display font-bold"
        >
          <Icon name="today" className="text-accent" />
          Pulsefit
        </Link>
        <div className="flex items-center gap-2">
          <RoleSwitcher role={role} />
          <ThemeCycleButton />
          <Link to={routes.status} aria-label="PWA status and settings" className="text-muted">
            <Icon name="info" />
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3.5 px-4 pb-4">
        <InstallBanner />
        <Outlet />
      </main>
      <LiveToasts enabled={role === 'athlete'} />
      <UpdatePrompt />
      <BottomNav role={role} />
    </div>
  )
}
