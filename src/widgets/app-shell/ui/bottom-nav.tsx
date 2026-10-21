import { NavLink } from 'react-router'
import { routes, type Role } from '@/shared/config'
import { cn } from '@/shared/lib'
import { Icon, type IconName } from '@/shared/ui'

type Item = { to: string; label: string; icon: IconName; end?: boolean }

const items: Record<Role, Item[]> = {
  athlete: [
    { to: routes.athlete.today, label: 'Today', icon: 'today', end: true },
    { to: routes.athlete.workout, label: 'Workout', icon: 'dumbbell' },
    { to: routes.athlete.diet, label: 'Diet', icon: 'food' },
    { to: routes.athlete.progress, label: 'Progress', icon: 'chart' },
  ],
  coach: [
    { to: routes.coach.athletes, label: 'Athletes', icon: 'users', end: true },
    { to: routes.coach.programs, label: 'Programs', icon: 'dumbbell' },
    { to: routes.coach.mealPlans, label: 'Meal plans', icon: 'food' },
    { to: routes.coach.library, label: 'Library', icon: 'book' },
  ],
}

export function BottomNav({ role }: { role: Role }) {
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-10 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-xl justify-around pt-2.5 pb-2">
        {items[role].map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn(
                  'flex w-[72px] flex-col items-center gap-1 text-[11px] font-semibold',
                  isActive ? 'text-accent' : 'text-muted',
                )
              }
            >
              <Icon name={it.icon} />
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
