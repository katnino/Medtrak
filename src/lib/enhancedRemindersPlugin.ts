/**
 * TypeScript types for the EnhancedReminders Capacitor plugin
 */

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