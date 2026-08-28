import { useEffect, useState } from 'react'
import { Settings, Bell, AlertCircle, CheckCircle } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'
import { useI18n } from '../lib/i18n'
import type { EnhancedReminderSettings } from '../types'
import packageJson from '../../package.json'

// EnhancedReminders plugin type
interface EnhancedRemindersPlugin {
  requestNotificationPermission(): Promise<void>
  requestExactAlarmPermission(): Promise<void>
  checkPermissions(): Promise<{ notification: 'granted' | 'denied'; exactAlarm: 'granted' | 'denied' }>
}

const EnhancedReminders = registerPlugin<EnhancedRemindersPlugin>('EnhancedReminders')

export default function SettingsView({ 
  enhancedReminders, 
  setEnhancedReminders 
}: { 
  enhancedReminders: EnhancedReminderSettings
  setEnhancedReminders: (settings: EnhancedReminderSettings | ((prev: EnhancedReminderSettings) => EnhancedReminderSettings)) => void
}) {
  const { t } = useI18n()
  const [exactAlarmPermission, setExactAlarmPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown')
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default'>('default')
  const isAndroid = Capacitor.getPlatform() === 'android'

  // Check permissions on mount
  useEffect(() => {
    if (!isAndroid) return
    
    const checkPermissions = async () => {
      try {
        const perms = await EnhancedReminders.checkPermissions()
        setNotificationPermission(perms.notification)
        setExactAlarmPermission(perms.exactAlarm)
      } catch (e) {
        console.warn('Failed to check permissions:', e)
        // Fallback to web permissions
        if ('Notification' in window) {
          const perm = Notification.permission
          setNotificationPermission(perm === 'granted' ? 'granted' : 
                                    perm === 'denied' ? 'denied' : 'default')
        }
      }
    }
    checkPermissions()
  }, [isAndroid])

  const toggleEnhancedReminders = () => {
    const newEnabled = !enhancedReminders.enabled
    setEnhancedReminders({ enabled: newEnabled })
    
    // If enabling on Android, check/request permissions
    if (newEnabled && isAndroid) {
      requestPermissions()
    }
  }

  const requestPermissions = async () => {
    try {
      // Request notification permission via native plugin (Android 13+)
      await EnhancedReminders.requestNotificationPermission()
      
      // Request exact alarm permission via native plugin (Android 12+)
      await EnhancedReminders.requestExactAlarmPermission()
      
      // Check permissions after requesting
      const perms = await EnhancedReminders.checkPermissions()
      setNotificationPermission(perms.notification)
      setExactAlarmPermission(perms.exactAlarm)
    } catch (e) {
      console.warn('Failed to request permissions:', e)
      // Fallback to web notification permission
      if ('Notification' in window) {
        const perm = Notification.permission
        if (perm === 'default') {
          const result = await Notification.requestPermission()
          setNotificationPermission(result === 'granted' ? 'granted' : 
                                   result === 'denied' ? 'denied' : 'default')
        } else {
          setNotificationPermission(perm === 'granted' ? 'granted' : 
                                   perm === 'denied' ? 'denied' : 'default')
        }
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-sage-dim/20 rounded-lg">
          <Settings size={22} strokeWidth={1.5} className="text-sage" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-ink">{t('settings')}</h1>
          <p className="text-sm text-ink-dim mt-1">{t('enhancedRemindersDesc')}</p>
        </div>
      </div>

      {/* Enhanced Reminders Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink">{t('enhancedReminders')}</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enhancedReminders.enabled}
              onChange={toggleEnhancedReminders}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              enhancedReminders.enabled ? 'bg-sage-dim' : 'bg-hairline'
            } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-sage`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                enhancedReminders.enabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>
        <p className="text-sm text-ink-dim mb-4">
          {enhancedReminders.enabled ? t('enhancedRemindersEnabled') : t('enhancedRemindersDisabled')}
        </p>

        {isAndroid && enhancedReminders.enabled && (
          <div className="bg-surface border border-hairline rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm text-ink">{t('permissionRequired')}</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-dusk-dim/20 rounded">
                  <Bell size={16} strokeWidth={1.5} className="text-dusk" />
                </div>
                <div>
                  <p className="text-sm text-ink">{t('notificationsPermission')}</p>
                  <p className="text-xs text-ink-faint">Required for full-screen alarms</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notificationPermission === 'granted' ? (
                  <>
                    <CheckCircle size={16} strokeWidth={2} className="text-sage" />
                    <span className="text-xs text-sage font-medium">{t('permissionGranted')}</span>
                  </>
                ) : notificationPermission === 'denied' ? (
                  <>
                    <AlertCircle size={16} strokeWidth={2} className="text-clay" />
                    <span className="text-xs text-clay font-medium">{t('permissionDenied')}</span>
                    <span className="text-xs text-ink-faint">({t('openSettings')})</span>
                  </>
                ) : (
                  <button
                    onClick={requestPermissions}
                    className="text-xs bg-dusk-dim/20 border border-dusk-dim text-dusk hover:bg-dusk-dim/30 transition-colors px-3 py-1.5 rounded"
                  >
                    {t('requestPermission')}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-clay-dim/20 rounded">
                  <AlertCircle size={16} strokeWidth={1.5} className="text-clay" />
                </div>
                <div>
                  <p className="text-sm text-ink">{t('exactAlarmsPermission')}</p>
                  <p className="text-xs text-ink-faint">Required for precise medication timing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {exactAlarmPermission === 'granted' ? (
                  <>
                    <CheckCircle size={16} strokeWidth={2} className="text-sage" />
                    <span className="text-xs text-sage font-medium">{t('permissionGranted')}</span>
                  </>
                ) : exactAlarmPermission === 'denied' ? (
                  <>
                    <AlertCircle size={16} strokeWidth={2} className="text-clay" />
                    <span className="text-xs text-clay font-medium">{t('permissionDenied')}</span>
                    <span className="text-xs text-ink-faint">({t('openSettings')})</span>
                  </>
                ) : (
                  <button
                    onClick={requestPermissions}
                    className="text-xs bg-clay-dim/20 border border-clay-dim text-clay hover:bg-clay-dim/30 transition-colors px-3 py-1.5 rounded"
                  >
                    {t('requestPermission')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!isAndroid && enhancedReminders.enabled && (
          <div className="bg-surface border border-hairline rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-sage-dim/20 rounded">
                <CheckCircle size={16} strokeWidth={1.5} className="text-sage" />
              </div>
              <p className="text-sm text-ink">
                Enhanced reminders are currently only available on Android. 
                On this platform, standard notifications with sound will be used.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* About / App Info Section */}
      <section>
        <h2 className="font-display text-lg text-ink mb-4">About</h2>
        <div className="bg-surface border border-hairline rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between text-ink-dim">
            <span>Version</span>
            <span className="font-mono text-ink">{packageJson.version}</span>
          </div>
          <div className="flex justify-between text-ink-dim">
            <span>Platform</span>
            <span className="font-mono text-ink capitalize">{Capacitor.getPlatform()}</span>
          </div>
          <div className="flex justify-between text-ink-dim">
            <span>Language</span>
            <span className="font-mono text-ink capitalize">{t('language')}</span>
          </div>
        </div>
      </section>
    </div>
  )
}