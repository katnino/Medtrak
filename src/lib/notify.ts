export function requestNotificationPermission(): void {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'default') {
    void Notification.requestPermission()
  }
}

export function sendBrowserNotification(title: string, body: string): void {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, tag: title })
  } catch {
    // some environments (e.g. iOS Safari PWA-less) reject constructor
  }
}

let audioCtx: AudioContext | null = null

// A soft, unobtrusive two-tone chime — no external audio asset needed.
export function playChime(): void {
  try {
    audioCtx = audioCtx ?? new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = audioCtx
    const now = ctx.currentTime
    const notes = [523.25, 659.25] // C5, E5 — soft, not alarming

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.32
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.14, start + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 1)
    })
  } catch {
    // audio unavailable — silent fail, visual alarm still shows
  }
}
