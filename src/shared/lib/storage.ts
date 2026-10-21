export const supportsPersist = () =>
  typeof navigator !== 'undefined' && !!navigator.storage?.persist

/** Asks the browser not to evict IndexedDB under storage pressure. */
export async function persistStorage(): Promise<boolean> {
  if (!supportsPersist()) return false
  if (await navigator.storage.persisted()) return true
  return navigator.storage.persist()
}

export async function storageInfo() {
  const persisted = (await navigator.storage?.persisted?.()) ?? false
  const est = (await navigator.storage?.estimate?.()) ?? {}
  return { persisted, usage: est.usage ?? 0, quota: est.quota ?? 0 }
}
