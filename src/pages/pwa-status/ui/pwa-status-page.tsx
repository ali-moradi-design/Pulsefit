import { useEffect, useState } from 'react'
import { useInstall } from '@/features/install-app'
import { useSyncStatus } from '@/features/sync-status'
import { ThemeSwitcher } from '@/features/switch-theme'
import { ReminderSettings } from '@/features/workout-reminder'
import { periodicTags, requestSync, resetDemoData } from '@/shared/api'
import {
  notificationPermission,
  notify,
  persistStorage,
  requestNotifications,
  storageInfo,
} from '@/shared/lib'
import { Button, Card, Icon } from '@/shared/ui'
import { detectCapabilities } from '../model/capabilities'

type Server = { simulated: boolean; received: number; lastSyncAt: number | null; records: number }

async function load() {
  const [tags, storage, res] = await Promise.all([
    periodicTags(),
    storageInfo(),
    fetch('/api/status').catch(() => null),
  ])
  const server = res?.ok
    ? { ...((await res.json()) as Server), cached: res.headers.get('X-From-Cache') === '1' }
    : null
  return { tags, storage, server }
}

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`

export function PwaStatusPage() {
  const installed = useInstall((s) => s.installed)
  const { online, queued } = useSyncStatus()
  const [tags, setTags] = useState<string[]>([])
  const [storage, setStorage] = useState({ persisted: false, usage: 0, quota: 0 })
  const [server, setServer] = useState<(Server & { cached: boolean }) | null>(null)

  const [tick, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  useEffect(() => {
    let off = false
    void load().then((d) => {
      if (off) return
      setTags(d.tags)
      setStorage(d.storage)
      if (d.server) setServer(d.server)
    })
    return () => {
      off = true
    }
  }, [queued, online, tick])

  const caps = detectCapabilities({ periodicTags: tags, persisted: storage.persisted, installed })

  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <h1 id="page-title" className="text-2xl font-bold">
        PWA status
      </h1>
      <p className="text-sm text-muted">
        What this browser supports, and how Pulsefit uses it. Missing features fall back gracefully.
      </p>

      <Card className="px-4 py-1">
        <ul className="divide-y divide-border">
          {caps.map((c) => (
            <li key={c.name} className="flex items-start gap-3 py-2.5">
              <span
                className={
                  c.supported
                    ? 'mt-0.5 grid size-6 flex-none place-items-center rounded-full bg-ok text-bg'
                    : 'mt-0.5 grid size-6 flex-none place-items-center rounded-full bg-surface-2 text-muted'
                }
              >
                <Icon name={c.supported ? 'check' : 'minus'} size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <b className="text-sm">
                  {c.name}
                  <span className="sr-only">{c.supported ? ': supported' : ': not supported'}</span>
                </b>
                <p className="text-xs text-muted">
                  {c.use}
                  {c.detail ? ` · ${c.detail}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Sync and the simulated server</h2>
        <p className="text-sm text-muted">
          There is no backend. A mock API inside the service worker plays the server, so the outbox
          and Background Sync really run.
        </p>
        <p className="text-sm tabular" data-testid="server-status">
          {online ? 'Online' : 'Offline'} · {queued} queued · server received{' '}
          {server?.received ?? '–'} changes
          {server?.lastSyncAt
            ? ` · last sync ${new Date(server.lastSyncAt).toLocaleTimeString('en')}`
            : ''}
          {server?.cached ? ' · (cached answer)' : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => void requestSync().then(refresh)}>
            Sync now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm('Reset all demo data in this browser?')) {
                void navigator.serviceWorker?.ready.then((r) =>
                  r.active?.postMessage({ type: 'RESET_SERVER' }),
                )
                void resetDemoData().then(refresh)
              }
            }}
          >
            Reset demo data
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Settings</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Theme</span>
          <ThemeSwitcher />
        </div>
        <ReminderSettings />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={notificationPermission() !== 'default'}
            onClick={() => void requestNotifications().then(refresh)}
          >
            Allow notifications
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={notificationPermission() !== 'granted'}
            onClick={() => void notify('Pulsefit', { body: 'Notifications work.', tag: 'test' })}
          >
            Test notification
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={storage.persisted}
            onClick={() => void persistStorage().then(refresh)}
          >
            Keep data on this device
          </Button>
        </div>
        <p className="text-xs text-muted">
          Storage: {mb(storage.usage)} used of {mb(storage.quota)}
          {storage.persisted ? ' · persistent' : ''}
        </p>
        <p className="text-xs text-muted">
          Push notifications while the app is fully closed need a push server, which this demo does
          not have. Local notifications and reminders replace them.
        </p>
      </Card>
    </section>
  )
}
