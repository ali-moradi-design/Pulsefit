import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { isIos, useInstall } from '../model/install'

const KEY = 'pulsefit-install-dismissed'

function readDismissed() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function InstallBanner() {
  const { promptEvent, installed, install } = useInstall()
  const [dismissed, setDismissed] = useState(readDismissed)
  const showIosHint = !installed && !promptEvent && isIos()
  if (installed || dismissed || (!promptEvent && !showIosHint)) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // Storage can be blocked; the banner then just comes back next time.
    }
  }

  return (
    <aside
      aria-label="Install Pulsefit"
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
    >
      <span className="grid size-10 flex-none place-items-center rounded-xl bg-accent-soft text-accent">
        <Icon name="download" />
      </span>
      <p className="flex-1 text-sm">
        {promptEvent ? (
          <b>Install Pulsefit for quick access and offline use.</b>
        ) : (
          <>
            <b>Install on iPhone:</b> tap Share, then “Add to Home Screen”.
          </>
        )}
      </p>
      {promptEvent && (
        <Button size="sm" onClick={() => void install()}>
          Install
        </Button>
      )}
      <button type="button" aria-label="Dismiss" onClick={dismiss} className="text-muted">
        <Icon name="close" />
      </button>
    </aside>
  )
}
