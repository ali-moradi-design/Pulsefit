import { Chip, Icon } from '@/shared/ui'
import { useSyncStatus } from '../model/use-sync-status'

const plural = (n: number) => `${n} change${n === 1 ? '' : 's'}`

export function SyncChip() {
  const { online, queued } = useSyncStatus()
  const label = !online
    ? queued > 0
      ? `Offline · ${plural(queued)} queued`
      : 'Offline'
    : queued > 0
      ? `Syncing ${plural(queued)}…`
      : 'All changes synced'
  return (
    <Chip role="status" aria-live="polite" data-testid="sync-status">
      {online ? (
        <span className={queued ? 'size-2 rounded-full bg-warn' : 'size-2 rounded-full bg-ok'} />
      ) : (
        <Icon name="cloudOff" size={14} />
      )}
      {label}
    </Chip>
  )
}
