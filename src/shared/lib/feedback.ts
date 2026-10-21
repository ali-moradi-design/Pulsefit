export const supportsVibration = () => typeof navigator !== 'undefined' && 'vibrate' in navigator

export function vibrate(pattern: number | number[]) {
  if (supportsVibration()) navigator.vibrate(pattern)
}

let audio: AudioContext | null = null

/** Short beeps made with Web Audio, so no sound file is needed offline. */
export function beep(times = 3) {
  try {
    audio ??= new AudioContext()
    const ctx = audio
    for (let i = 0; i < times; i++) {
      const t = ctx.currentTime + i * 0.25
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = i === times - 1 ? 1320 : 880
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.2)
    }
  } catch {
    // Audio can be blocked until the user interacts; vibration still works.
  }
}

/** Must run inside a user gesture on iOS so later beeps are allowed. */
export function unlockAudio() {
  try {
    audio ??= new AudioContext()
    void audio.resume()
  } catch {
    // ignore
  }
}
