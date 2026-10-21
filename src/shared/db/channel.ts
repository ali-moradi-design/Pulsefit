// Live messages between open tabs (coach in one, athlete in another) and the service worker.
export type ChannelMessage =
  | { type: 'program-assigned'; programName: string }
  | { type: 'meal-plan-assigned'; planName: string }
  | { type: 'note-sent'; text: string }
  | { type: 'synced'; count: number }

const NAME = 'pulsefit'

export function postMessage(message: ChannelMessage) {
  if (typeof BroadcastChannel === 'undefined') return
  const ch = new BroadcastChannel(NAME)
  ch.postMessage(message)
  ch.close()
}

export function subscribe(handler: (message: ChannelMessage) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {}
  const ch = new BroadcastChannel(NAME)
  ch.onmessage = (e: MessageEvent<ChannelMessage>) => handler(e.data)
  return () => ch.close()
}
