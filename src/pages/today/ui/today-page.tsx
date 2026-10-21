import { SyncChip } from '@/features/sync-status'

export function TodayPage() {
  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <h1 id="page-title" className="text-[26px] font-bold">
        Today
      </h1>
      <SyncChip />
      <p className="text-muted">Coming in a later version.</p>
    </section>
  )
}
