import { Capacitor } from '@capacitor/core'
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications'
import { occurrencesForDate, toDateKey } from './schedule'
import type { Appointment, DoseLog, Medication } from '../types'

const SCHEDULED_IDS_KEY = 'medtrak.localNotificationIds'
const LOOK_AHEAD_DAYS = 30
// iOS allows at most 64 pending local notifications. Leave a small buffer for
// the operating system and any future app notifications.
const MAX_PENDING_NOTIFICATIONS = 60

function storedIds(): number[] {
  try {
    const value = JSON.parse(localStorage.getItem(SCHEDULED_IDS_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((id): id is number => Number.isInteger(id)) : []
  } catch {
    return []
  }
}

function saveIds(ids: number[]): void {
  try {
    localStorage.setItem(SCHEDULED_IDS_KEY, JSON.stringify(ids))
  } catch {
    // The native schedules still work if browser storage is unavailable.
  }
}

function notificationId(key: string, used: Set<number>): number {
  let hash = 2166136261
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  let id = (hash >>> 0) & 0x7fffffff
  if (id === 0) id = 1
  while (used.has(id)) id = id === 0x7fffffff ? 1 : id + 1
  used.add(id)
  return id
}

function dateAt(dateKey: string, time: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

function upcomingNotifications(
  medications: Medication[],
  logs: Record<string, DoseLog>,
  appointments: Appointment[],
): LocalNotificationSchema[] {
  const now = new Date()
  const usedIds = new Set<number>()
  const notifications: Array<LocalNotificationSchema & { when: number }> = []

  for (let offset = 0; offset <= LOOK_AHEAD_DAYS; offset += 1) {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + offset)
    const dateKey = toDateKey(date)

    for (const occurrence of occurrencesForDate(medications, logs, dateKey)) {
      const at = dateAt(dateKey, occurrence.time)
      if (at <= now) continue
      notifications.push({
        id: notificationId(`dose:${occurrence.key}`, usedIds),
        title: `${occurrence.medication.name} — ${occurrence.medication.dosage}`,
        body: `Scheduled for ${occurrence.time}`,
        schedule: { at, allowWhileIdle: true },
        extra: { kind: 'dose', key: occurrence.key },
        foreground: false,
        when: at.getTime(),
      })
    }
  }

  for (const appointment of appointments) {
    if (!appointment.reminder) continue
    const at = dateAt(appointment.date, appointment.time)
    if (at <= now) continue
    notifications.push({
      id: notificationId(`appointment:${appointment.id}`, usedIds),
      title: appointment.title,
      body: [appointment.provider, appointment.location].filter(Boolean).join(' · ') || `At ${appointment.time}`,
      schedule: { at, allowWhileIdle: true },
      extra: { kind: 'appointment', id: appointment.id },
      foreground: false,
      when: at.getTime(),
    })
  }

  return notifications
    .sort((a, b) => a.when - b.when)
    .slice(0, MAX_PENDING_NOTIFICATIONS)
    .map(({ when: _when, ...notification }) => notification)
}

let syncQueue: Promise<void> = Promise.resolve()

/**
 * Mirrors future reminders into the device scheduler. This is deliberately a
 * no-op in browsers, so the static web app remains backend-free.
 */
export function syncLocalNotifications(
  medications: Medication[],
  logs: Record<string, DoseLog>,
  appointments: Appointment[],
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve()

  syncQueue = syncQueue.catch(() => undefined).then(async () => {
    const permission = await LocalNotifications.checkPermissions()
    const granted = permission.display === 'granted'
      ? permission
      : await LocalNotifications.requestPermissions()
    if (granted.display !== 'granted') return

    const previousIds = storedIds()
    if (previousIds.length > 0) {
      await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) })
    }

    const notifications = upcomingNotifications(medications, logs, appointments)
    if (notifications.length > 0) await LocalNotifications.schedule({ notifications })
    saveIds(notifications.map((notification) => notification.id))
  })

  return syncQueue
}
