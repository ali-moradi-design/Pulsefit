import { Link } from 'react-router'
import { useStreak } from '@/entities/body'
import { markRead, useNotes, useUnreadCount } from '@/entities/note'
import {
  dayFor,
  estimateMinutes,
  programWeek,
  totalSets,
  useProgram,
  useTodayWorkoutLog,
} from '@/entities/training'
import { useExerciseMap } from '@/entities/library'
import { SyncChip } from '@/features/sync-status'
import { routes } from '@/shared/config'
import { Card, Chip, Icon } from '@/shared/ui'
import { NutritionSummary } from '@/widgets/nutrition-summary'

const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' })

export function TodayPage() {
  const program = useProgram()
  const exercises = useExerciseMap()
  const todayLog = useTodayWorkoutLog()
  const streak = useStreak()
  const notes = useNotes()
  const unread = useUnreadCount()
  const day = dayFor(program)
  const note = notes[0]

  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <div>
        <p className="text-sm text-muted">{dateLabel.format(new Date())}</p>
        <h1 id="page-title" className="text-[26px] font-bold">
          Hi, Sam
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip tone="accent">
          <Icon name="flame" size={14} />
          {streak}-day streak
        </Chip>
        <SyncChip />
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex justify-between text-xs text-muted">
          <span className="font-semibold tracking-[.06em]">TODAY’S WORKOUT</span>
          {program && (
            <span>
              Week {programWeek(program)} of {program.weeks}
            </span>
          )}
        </div>
        {day ? (
          <>
            <div>
              <h2 className="text-[22px] font-bold">{day.title}</h2>
              <p className="text-sm text-muted">
                {day.items.length} exercises · {totalSets(day)} sets · ~{estimateMinutes(day)} min
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {day.items.slice(0, 3).map((it) => (
                <Chip key={it.exerciseId}>
                  {exercises.get(it.exerciseId)?.name ?? it.exerciseId}
                </Chip>
              ))}
              {day.items.length > 3 && <Chip>+{day.items.length - 3}</Chip>}
            </div>
            {todayLog?.finishedAt ? (
              <p className="flex items-center gap-2 font-semibold text-ok">
                <Icon name="check" /> Done for today
              </p>
            ) : (
              <Link
                to={`${routes.athlete.workout}?start=1`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-on-accent shadow-glow"
              >
                <Icon name="dumbbell" />
                {todayLog ? 'Continue workout' : 'Start workout'}
              </Link>
            )}
          </>
        ) : (
          <p className="text-muted">Rest day. Recovery is part of the plan.</p>
        )}
      </Card>

      <NutritionSummary variant="ring" />

      {note && (
        <Card className="flex items-start gap-3">
          <span className="grid size-10 flex-none place-items-center rounded-xl bg-surface-2 text-accent">
            <Icon name="msg" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <b className="text-sm">Note from Coach Lee</b>
              {unread > 0 && (
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-on-accent">
                  {unread}
                  <span className="sr-only"> unread</span>
                </span>
              )}
            </div>
            <p className="text-sm text-muted">{note.text}</p>
            {!note.readAt && (
              <button
                type="button"
                onClick={() => void markRead(note)}
                className="mt-1 text-sm font-semibold text-accent"
              >
                Mark as read
              </button>
            )}
          </div>
        </Card>
      )}
    </section>
  )
}
