/**
 * TypeScript types for the EnhancedReminders Capacitor plugin
 */
import type { PluginListenerHandle } from '@capacitor/core'

/** Payload emitted when the native full-screen alarm's action buttons are used. */
export interface EnhancedReminderActionEvent {
  action: 'taken' | 'skip' | 'snooze'
  doseKey: string
}

export interface EnhancedReminderPlugin {
  /**
   * Initialize the TTS engine
   */
  initializeTts(): Promise<void>

  /**
   * Schedule an enhanced reminder with full-screen alarm and TTS
   */
  scheduleEnhancedReminder(options: ScheduleEnhancedReminderOptions): Promise<void>

  /**
   * Cancel a specific enhanced reminder by ID
   */
  cancelEnhancedReminder(options: { id: number }): Promise<void>

  /**
   * Cancel all scheduled enhanced reminders
   */
  cancelAllEnhancedReminders(): Promise<void>

  /**
   * Check if enhanced reminders are supported on this platform
   */
  isSupported(): Promise<{ supported: boolean }>

  /**
   * Speak text via TTS
   */
  speak(options: { text: string; language?: string }): Promise<void>

  /**
   * Stop any ongoing TTS speech
   */
  stopSpeaking(): Promise<void>

  /**
   * Request notification permission (Android 13+)
   */
  requestNotificationPermission(): Promise<void>

  /**
   * Request exact alarm permission (Android 12+)
   * Opens system settings for "Alarms & reminders"
   */
  requestExactAlarmPermission(): Promise<void>

  /**
   * Check current permission status
   */
  checkPermissions(): Promise<{ notification: 'granted' | 'denied'; exactAlarm: 'granted' | 'denied' }>

  /**
   * Listen for native alarm "taken"/"skip"/"snooze" actions so the medication
   * log can stay in sync with the full-screen alarm / notification UI.
   */
  addListener(
    eventName: 'enhancedReminderAction',
    listener: (event: EnhancedReminderActionEvent) => void,
  ): Promise<PluginListenerHandle>

  /**
   * Return (and clear) actions the user took on native notifications or the
   * full-screen alarm while the web view bridge was not listening. The app
   * should call this on resume / cold start so those actions still mirror into
   * the medication log.
   */
  drainPendingActions(): Promise<{
    actions: Array<{
      notificationId: number
      action: 'taken' | 'skip' | 'snooze'
      doseKey: string
      ts: number
    }>
  }>
}

export interface ScheduleEnhancedReminderOptions {
  /** Unique notification ID */
  id: number
  /** Dose key for tracking */
  key: string
  /** Medication name */
  medicationName: string
  /** Medication dosage */
  dosage: string
  /** Scheduled time string (e.g., "08:00") */
  time: string
  /** Trigger time in milliseconds since epoch */
  triggerAtMillis: number
}