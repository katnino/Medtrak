import { Capacitor } from '@capacitor/core'
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications'
import { occurrencesForDate, toDateKey } from './schedule'
import { translate, type Language } from './i18n'
import type { Appointment, DoseLog, DoseOccurrence, Medication } from '../types'
import type { EnhancedReminderPlugin, ScheduleEnhancedReminderOptions } from './enhancedRemindersPlugin'

const SCHEDULED_IDS_KEY = 'medtrak.localNotificationIds'
const LOOK_AHEAD_DAYS = 30
// iOS allows at most 64 pending local notifications. Leave a small buffer for
// the operating system and any future app notifications.
const MAX_PENDING_NOTIFICATIONS = 60

export const SNOOZE_MINUTES = 10
export const MEDICATION_TAKEN_ACTION = 'medication-taken'
export const MEDICATION_SNOOZE_ACTION = 'medication-snooze-10'

// Android notification-channel sound settings cannot be changed after a
// channel has been created. A new ID lets existing installs receive the new
// reminder sound without touching a channel the user may have customised.
const MEDICATION_CHANNEL_ID = 'medication-reminders-v2'
const MEDICATION_ACTION_TYPE_ID = 'medication-actions'
const MEDICATION_SOUND = Capacitor.getPlatform() === 'android'
  ? 'medtrak_reminder.wav'
  : 'medtrak-reminder.wav'

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

export function dateAt(dateKey: string, time: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

function medicationNotification(
  occurrence: DoseOccurrence,
  at: Date,
  idKey: string,
  usedIds: Set<number>,
  language: Language,
): LocalNotificationSchema & { when: number } {
  return {
    id: notificationId(idKey, usedIds),
    title: translate(language, 'medicationDue', { name: occurrence.medication.name }),
    body: `${occurrence.medication.dosage} · ${translate(language, 'scheduledFor', { time: occurrence.time })}`,
    schedule: { at, allowWhileIdle: true },
    extra: { kind: 'dose', key: occurrence.key },
    actionTypeId: MEDICATION_ACTION_TYPE_ID,
    channelId: MEDICATION_CHANNEL_ID,
    // iOS requires an explicit sound on each local notification. Android 8+
    // uses the sound configured on the notification channel below.
    sound: MEDICATION_SOUND,
    // On Android this raises the notification priority so it can appear as a heads-up alert.
    foreground: true,
    when: at.getTime(),
  }
}

async function configureMedicationNotifications(language: Language): Promise<void> {
  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: MEDICATION_CHANNEL_ID,
      name: translate(language, 'medicationReminders'),
      description: translate(language, 'medicationReminderDescription'),
      sound: MEDICATION_SOUND,
      importance: 5,
      vibration: true,
      lights: true,
      lightColor: '#C57C5A',
      visibility: 1,
    })
  }

  await LocalNotifications.registerActionTypes({
    types: [{
      id: MEDICATION_ACTION_TYPE_ID,
      actions: [
        { id: MEDICATION_TAKEN_ACTION, title: translate(language, 'markTaken') },
        { id: MEDICATION_SNOOZE_ACTION, title: translate(language, 'snoozeMinutes', { minutes: SNOOZE_MINUTES }) },
      ],
    }],
  })
}

export function upcomingNotifications(
  medications: Medication[],
  logs: Record<string, DoseLog>,
  appointments: Appointment[],
  snoozedUntil: Record<string, number>,
  language: Language,
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
      const snoozeAt = snoozedUntil[occurrence.key]
      const isSnoozed = typeof snoozeAt === 'number' && snoozeAt > now.getTime()
      const effectiveAt = isSnoozed ? new Date(snoozeAt) : at
      if (effectiveAt <= now) continue
      notifications.push(medicationNotification(
        occurrence,
        effectiveAt,
        isSnoozed ? `snooze:${occurrence.key}` : `dose:${occurrence.key}`,
        usedIds,
        language,
      ))
    }
  }

  // A late-night snooze can cross midnight, placing its original occurrence
  // outside the rolling window above. Keep that follow-up notification intact.
  for (const [key, snoozeAt] of Object.entries(snoozedUntil)) {
    if (snoozeAt <= now.getTime() || notifications.some((notification) => notification.extra?.key === key)) continue
    const [medicationId, date, time] = key.split('__')
    const medication = medications.find((med) => med.id === medicationId && med.active)
    if (!medication || !time) continue
    notifications.push(medicationNotification(
      { key, medication, date, time, status: 'pending' },
      new Date(snoozeAt),
      `snooze:${key}`,
      usedIds,
      language,
    ))
  }

  for (const appointment of appointments) {
    if (!appointment.reminder) continue
    const at = dateAt(appointment.date, appointment.time)
    if (at <= now) continue
    notifications.push({
      id: notificationId(`appointment:${appointment.id}`, usedIds),
      title: appointment.title,
      body: [appointment.provider, appointment.location].filter(Boolean).join(' · ') || translate(language, 'atTime', { time: appointment.time }),
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
  snoozedUntil: Record<string, number>,
  language: Language,
  enhancedRemindersEnabled: boolean = false,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve()

  // If enhanced reminders are enabled on Android, use the custom plugin
  if (enhancedRemindersEnabled && Capacitor.getPlatform() === 'android') {
    return syncEnhancedReminders(medications, logs, appointments, snoozedUntil, language)
  }

  syncQueue = syncQueue.catch(() => undefined).then(async () => {
    const permission = await LocalNotifications.checkPermissions()
    const granted = permission.display === 'granted'
      ? permission
      : await LocalNotifications.requestPermissions()
    if (granted.display !== 'granted') return

    await configureMedicationNotifications(language)

    const previousIds = storedIds()
    if (previousIds.length > 0) {
      await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) })
    }

    const notifications = upcomingNotifications(medications, logs, appointments, snoozedUntil, language)
    if (notifications.length > 0) await LocalNotifications.schedule({ notifications })
    saveIds(notifications.map((notification) => notification.id))
  })

  return syncQueue
}

// Enhanced reminders sync using custom Capacitor plugin
async function syncEnhancedReminders(
  medications: Medication[],
  logs: Record<string, DoseLog>,
  appointments: Appointment[],
  snoozedUntil: Record<string, number>,
  language: Language,
): Promise<void> {
  syncQueue = syncQueue.catch(() => undefined).then(async () => {
    try {
      // Dynamically import the plugin to avoid bundling issues on web
      const { registerPlugin } = await import('@capacitor/core')
      const EnhancedReminders = registerPlugin<EnhancedReminderPlugin>('EnhancedReminders', { web: () => null })
      
      if (!EnhancedReminders) {
        console.warn('[EnhancedReminders] Plugin not available, falling back to standard notifications')
        // Fall back to standard notifications for appointments only
        const permission = await LocalNotifications.checkPermissions()
        const granted = permission.display === 'granted'
          ? permission
          : await LocalNotifications.requestPermissions()
        if (granted.display !== 'granted') return

        await configureMedicationNotifications(language)

        const previousIds = storedIds()
        if (previousIds.length > 0) {
          await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) })
        }

        const notifications = upcomingNotifications(medications, logs, appointments, snoozedUntil, language)
        if (notifications.length > 0) await LocalNotifications.schedule({ notifications })
        saveIds(notifications.map((notification) => notification.id))
        return
      }

      // Initialize TTS
      await EnhancedReminders.initializeTts().catch((err: unknown) => 
        console.warn('[EnhancedReminders] TTS init failed:', err)
      )

      // Cancel all existing enhanced reminders
      await EnhancedReminders.cancelAllEnhancedReminders().catch((err: unknown) =>
        console.warn('[EnhancedReminders] Cancel all failed:', err)
      )

      // Schedule enhanced reminders for pending medication doses
      const now = new Date()
      let notificationIdCounter = 1

      // Schedule for each day in the look-ahead window
      for (let dayOffset = 0; dayOffset < LOOK_AHEAD_DAYS; dayOffset++) {
        const date = new Date(now)
        date.setDate(date.getDate() + dayOffset)
        const dateKey = toDateKey(date)

        const occ = occurrencesForDate(medications, logs, dateKey)
        const pending = occ.filter(o => o.status === 'pending')

        for (const occurrence of pending) {
          // Check if snoozed
          const snoozeUntil = snoozedUntil[occurrence.key]
          let triggerAt = dateAt(dateKey, occurrence.time)
          
          if (snoozeUntil && snoozeUntil > now.getTime()) {
            triggerAt = new Date(snoozeUntil)
          }

          if (triggerAt.getTime() <= now.getTime()) continue

          const med = occurrence.medication
          
          // Schedule via plugin
          try {
            await EnhancedReminders.scheduleEnhancedReminder({
              id: notificationIdCounter++,
              key: occurrence.key,
              medicationName: med.name,
              dosage: med.dosage,
              time: occurrence.time,
              triggerAtMillis: triggerAt.getTime()
            } satisfies ScheduleEnhancedReminderOptions)
          } catch (err) {
            console.error('[EnhancedReminders] Failed to schedule:', err)
          }
        }
      }

      // Still use standard LocalNotifications for appointments (they don't need full-screen)
      const permission = await LocalNotifications.checkPermissions()
      const granted = permission.display === 'granted'
        ? permission
        : await LocalNotifications.requestPermissions()
      if (granted.display !== 'granted') return

      await configureMedicationNotifications(language)

      const previousIds = storedIds()
      if (previousIds.length > 0) {
        await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) })
      }

      // Only schedule appointment notifications via standard path
      const appointmentNotifications = upcomingNotifications(medications, logs, appointments, snoozedUntil, language)
        .filter(n => n.extra?.kind === 'appointment')
      
      if (appointmentNotifications.length > 0) await LocalNotifications.schedule({ notifications: appointmentNotifications })
      saveIds(appointmentNotifications.map((notification) => notification.id))

    } catch (err) {
      console.error('[EnhancedReminders] Sync failed:', err)
      // Fall back to standard notifications
      const permission = await LocalNotifications.checkPermissions()
      const granted = permission.display === 'granted'
        ? permission
        : await LocalNotifications.requestPermissions()
      if (granted.display !== 'granted') return

      await configureMedicationNotifications(language)

      const previousIds = storedIds()
      if (previousIds.length > 0) {
        await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) })
      }

      const notifications = upcomingNotifications(medications, logs, appointments, snoozedUntil, language)
      if (notifications.length > 0) await LocalNotifications.schedule({ notifications })
      saveIds(notifications.map((notification) => notification.id))
    }
  })

  return syncQueue
}
