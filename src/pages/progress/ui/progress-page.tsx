import { LogWeightForm } from '@/features/log-weight'
import { SyncChip } from '@/features/sync-status'

export function ProgressPage() {
  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h1 id="page-title" className="text-[26px] font-bold">
          Progress
        </h1>
        <SyncChip />
      </div>
      <LogWeightForm />
    </section>
  )
}
