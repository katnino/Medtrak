import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar, { type View } from './components/Sidebar'
import TodayView from './components/TodayView'
import CalendarView from './components/CalendarView'
import MedicationsView from './components/MedicationsView'
import SettingsView from './components/SettingsView'
import MedicationModal from './components/MedicationModal'
import AppointmentModal from './components/AppointmentModal'
import AlarmOverlay from './components/AlarmOverlay'
import AppointmentAlarmOverlay from './components/AppointmentAlarmOverlay'
import { useLocalStorage } from './lib/storage'
import { LanguageProvider, type Language } from './lib/i18n'
import { appointmentsForDate, occurrencesForDate, toDateKey } from './lib/schedule'
import { playChime, requestNotificationPermission, sendBrowserNotification } from './lib/notify'
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { LocalNotifications, type ActionPerformed } from '@capacitor/local-notifications'
import {
  MEDICATION_SNOOZE_ACTION,
  MEDICATION_TAKEN_ACTION,
  SNOOZE_MINUTES,
  syncLocalNotifications,
} from './lib/localNotifications'
import type { EnhancedReminderPlugin, EnhancedReminderActionEvent } from './lib/enhancedRemindersPlugin'
import type { Appointment, DoseLog, DoseOccurrence, DoseStatus, Medication, EnhancedReminderSettings } from './types'

export default function App() {
  const [view, setView] = useState<View>('today')
  const [medications, setMedications] = useLocalStorage<Medication[]>('medtrak.medications', [])
  const [logs, setLogs] = useLocalStorage<Record<string, DoseLog>>('medtrak.logs', {})
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('medtrak.appointments', [])
  const [firedAlarms, setFiredAlarms] = useLocalStorage<Record<string, boolean>>('medtrak.fired', {})
  const [snoozedUntil, setSnoozedUntil] = useLocalStorage<Record<string, number>>('medtrak.snoozedUntil', {})
  const [language, setLanguage] = useLocalStorage<Language>('medtrak.language', 'en')
  const [enhancedReminders, setEnhancedReminders] = useLocalStorage<EnhancedReminderSettings>('medtrak.enhancedReminders', { enabled: false })

  const [modalMed, setModalMed] = useState<Medication | null | undefined>(undefined) // undefined = closed
  const [modalAppt, setModalAppt] = useState<
    { appt: Appointment | null; defaultDate: string } | undefined
  >(undefined) // undefined = closed

  const [alarmQueue, setAlarmQueue] = useState<DoseOccurrence[]>([])
  const [apptAlarmQueue, setApptAlarmQueue] = useState<Appointment[]>([])
  const [now, setNow] = useState(new Date())

  const activeMedications = useMemo(() => medications.filter((m) => m.active), [medications])

  // clock tick — the ring and "due now" state redraw live
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // Native builds keep a rolling, on-device notification schedule. The helper
  // is a no-op on the web, where the existing in-tab reminder engine remains.
  useEffect(() => {
    void syncLocalNotifications(medications, logs, appointments, snoozedUntil, language, enhancedReminders.enabled)
  }, [medications, logs, appointments, snoozedUntil, language, enhancedReminders.enabled])

  // reminder engine — checks every 20s for newly-due, un-acted doses & appointments
  const alarmingKeys = useRef(new Set(alarmQueue.map((o) => o.key)))
  alarmingKeys.current = new Set(alarmQueue.map((o) => o.key))
  const apptAlarmingIds = useRef(new Set(apptAlarmQueue.map((a) => a.id)))
  apptAlarmingIds.current = new Set(apptAlarmQueue.map((a) => a.id))

  useEffect(() => {
    const check = () => {
      const current = new Date()
      const today = toDateKey(current)
      const nowHM = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`

      // medication doses
      const occ = occurrencesForDate(medications, logs, today)
      const due = occ.filter(
        (o) => o.status === 'pending'
          && o.time <= nowHM
          && (!snoozedUntil[o.key] || snoozedUntil[o.key] <= current.getTime())
          && !firedAlarms[o.key]
          && !alarmingKeys.current.has(o.key),
      )

      if (due.length > 0) {
        setAlarmQueue((q) => [...q, ...due])
        setFiredAlarms((prev) => {
          const next = { ...prev }
          due.forEach((o) => {
            next[o.key] = true
          })
          return next
        })
        due.forEach((o) => {
          sendBrowserNotification(`${o.medication.name} — ${o.medication.dosage}`, language === 'sr-Latn' ? `Zakazano za ${o.time}` : `Scheduled for ${o.time}`)
        })
        playChime()
      }

      // appointments
      const todaysAppts = appointmentsForDate(appointments, today)
      const dueAppts = todaysAppts.filter((a) => {
        const key = `appt:${a.id}`
        return a.reminder && a.time <= nowHM && !firedAlarms[key] && !apptAlarmingIds.current.has(a.id)
      })

      if (dueAppts.length > 0) {
        setApptAlarmQueue((q) => [...q, ...dueAppts])
        setFiredAlarms((prev) => {
          const next = { ...prev }
          dueAppts.forEach((a) => {
            next[`appt:${a.id}`] = true
          })
          return next
        })
        dueAppts.forEach((a) => {
          sendBrowserNotification(a.title, [a.provider, a.location].filter(Boolean).join(' · ') || (language === 'sr-Latn' ? `U ${a.time}` : `At ${a.time}`))
        })
        playChime()
      }
    }

    check()
    const id = setInterval(check, 20_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medications, logs, appointments, firedAlarms, snoozedUntil, language])

  const setStatus = (key: string, status: DoseStatus) => {
    const [medicationId, date, time] = key.split('__')
    setLogs((prev) => {
      if (status === 'pending') {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return {
        ...prev,
        [key]: { key, medicationId, date, time, status, actedAt: Date.now() },
      }
    })
    if (status !== 'pending') {
      setSnoozedUntil((prev) => {
        if (!prev[key]) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const todayKey = toDateKey(now)
  const todayOccurrences = occurrencesForDate(activeMedications, logs, todayKey)
  const todayAppointments = appointmentsForDate(appointments, todayKey)

  const saveMedication = (med: Medication) => {
    setMedications((prev) => {
      const exists = prev.some((m) => m.id === med.id)
      return exists ? prev.map((m) => (m.id === med.id ? med : m)) : [...prev, med]
    })
    setModalMed(undefined)
  }

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id))
    setModalMed(undefined)
  }

  const saveAppointment = (appt: Appointment) => {
    setAppointments((prev) => {
      const exists = prev.some((a) => a.id === appt.id)
      return exists ? prev.map((a) => (a.id === appt.id ? appt : a)) : [...prev, appt]
    })
    setModalAppt(undefined)
  }

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    setModalAppt(undefined)
  }

  const currentAlarm = alarmQueue[0]
  const currentApptAlarm = !currentAlarm ? apptAlarmQueue[0] : undefined

  const resolveAlarm = (status: DoseStatus) => {
    if (!currentAlarm) return
    setStatus(currentAlarm.key, status)
    setAlarmQueue((q) => q.slice(1))
  }

  const snoozeDose = (key: string) => {
    setSnoozedUntil((prev) => ({
      ...prev,
      [key]: Date.now() + SNOOZE_MINUTES * 60_000,
    }))
    setFiredAlarms((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setAlarmQueue((q) => q.filter((occurrence) => occurrence.key !== key))
  }

  const nativeActionHandler = useRef<(action: ActionPerformed) => void>(() => undefined)
  nativeActionHandler.current = ({ actionId, notification }) => {
    const extra = notification.extra as { kind?: string; key?: string } | undefined
    if (extra?.kind !== 'dose' || !extra.key) return
    if (actionId === MEDICATION_TAKEN_ACTION) {
      setStatus(extra.key, 'taken')
      setAlarmQueue((q) => q.filter((occurrence) => occurrence.key !== extra.key))
    }
    if (actionId === MEDICATION_SNOOZE_ACTION) snoozeDose(extra.key)
  }

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let removed = false
    let listener: Awaited<ReturnType<typeof LocalNotifications.addListener>> | undefined
    void LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      nativeActionHandler.current(action)
    }).then((handle) => {
      if (removed) void handle.remove()
      else listener = handle
    })
    return () => {
      removed = true
      if (listener) void listener.remove()
    }
  }, [])

  // --- Enhanced-reminder native mirroring (additive; no UI changes) ---
  // Apply a native "taken"/"skip"/"snooze" action to the medication log so
  // acknowledging a notification / full-screen alarm stays in sync with the app.
  const applyEnhancedAction = (action: string, doseKey: string) => {
    const rawKey = doseKey.replace(/^(dose|snooze):/, '')
    // Mirror to the log AND clear the in-app alarm queue — the original
    // standard-notification handler did both; without clearing the queue the
    // alarm overlay would re-prompt even after a successful mirror.
    setAlarmQueue((q) => q.filter((o) => o.key !== rawKey))
    if (action === 'taken') {
      setStatus(rawKey, 'taken')
    } else if (action === 'skip') {
      setStatus(rawKey, 'skipped')
    } else if (action === 'snooze') {
      const snoozeAt = Date.now() + SNOOZE_MINUTES * 60 * 1000
      setSnoozedUntil((prev) => ({ ...prev, [rawKey]: snoozeAt }))
      void syncLocalNotifications(
        medications,
        logs,
        appointments,
        { ...snoozedUntil, [rawKey]: snoozeAt },
        language,
        enhancedReminders.enabled,
      )
    }
  }
  const applyEnhancedActionRef = useRef(applyEnhancedAction)
  applyEnhancedActionRef.current = applyEnhancedAction

  // Live bridge: mirror foreground notification / alarm actions instantly.
  useEffect(() => {
    if (!enhancedReminders.enabled) return
    let removed = false
    let handle: PluginListenerHandle | undefined
    const EnhancedReminders = registerPlugin<EnhancedReminderPlugin>('EnhancedReminders', { web: () => null })
    void (async () => {
      if (!EnhancedReminders || removed) return
      handle = await EnhancedReminders.addListener('enhancedReminderAction', (event: EnhancedReminderActionEvent) => {
        applyEnhancedActionRef.current(event.action, event.doseKey)
      })
    })()
    return () => {
      removed = true
      void handle?.remove()
    }
  }, [enhancedReminders.enabled])

  // Reconcile actions performed while the web bridge was not listening
  // (app backgrounded or killed). Drains the durable queue on resume / cold start.
  useEffect(() => {
    if (!enhancedReminders.enabled) return
    let removed = false
    const EnhancedReminders = registerPlugin<EnhancedReminderPlugin>('EnhancedReminders', { web: () => null })
    const reconcile = async () => {
      if (removed) return
      try {
        const result = await EnhancedReminders.drainPendingActions()
        for (const a of result.actions ?? []) {
          applyEnhancedActionRef.current(a.action, a.doseKey)
        }
      } catch {
        // Bridge/plugin not ready — the action stays queued for the next resume.
      }
    }
    const resumeHandle = CapacitorApp.addListener('appStateChange', (state) => {
      if (state.isActive) void reconcile()
    })
    void reconcile()
    return () => {
      removed = true
      void resumeHandle.then((h) => h.remove())
    }
  }, [enhancedReminders.enabled])

  // Safety net: the live `notifyListeners` bridge is not reliably delivered
  // while the app is merely backgrounded, and a foreground tap produces no
  // appStateChange. Poll the durable queue so any persisted native action is
  // applied within a few seconds regardless of app state.
  useEffect(() => {
    if (!enhancedReminders.enabled) return
    let removed = false
    const EnhancedReminders = registerPlugin<EnhancedReminderPlugin>('EnhancedReminders', { web: () => null })
    const id = setInterval(async () => {
      if (removed) return
      try {
        const result = await EnhancedReminders.drainPendingActions()
        for (const a of result.actions ?? []) {
          applyEnhancedActionRef.current(a.action, a.doseKey)
        }
      } catch {
        // Plugin/bridge not ready — the action stays queued for the next poll.
      }
    }, 15_000)
    return () => {
      removed = true
      clearInterval(id)
    }
  }, [enhancedReminders.enabled])

  const acknowledgeApptAlarm = () => {
    if (!currentApptAlarm) return
    setApptAlarmQueue((q) => q.slice(1))
  }

  return (
    <LanguageProvider language={language} setLanguage={setLanguage}>
    <div className="min-h-screen flex flex-col md:flex-row bg-void">
      <Sidebar view={view} onChange={setView} medicationCount={activeMedications.length} />

      <main className="flex-1 min-w-0">
        {view === 'today' && (
          <TodayView
            occurrences={todayOccurrences}
            appointments={todayAppointments}
            now={now}
            onSetStatus={setStatus}
            onEditAppointment={(appt) => setModalAppt({ appt, defaultDate: appt.date })}
          />
        )}
        {view === 'calendar' && (
          <CalendarView
            medications={medications}
            logs={logs}
            appointments={appointments}
            onSetStatus={setStatus}
            onAddAppointment={(dateKey) => setModalAppt({ appt: null, defaultDate: dateKey })}
            onEditAppointment={(appt) => setModalAppt({ appt, defaultDate: appt.date })}
          />
        )}
        {view === 'medications' && (
          <MedicationsView
            medications={medications}
            onAdd={() => setModalMed(null)}
            onEdit={(med) => setModalMed(med)}
          />
        )}
        {view === 'settings' && (
          <SettingsView
            enhancedReminders={enhancedReminders}
            setEnhancedReminders={setEnhancedReminders}
          />
        )}
      </main>

      {modalMed !== undefined && (
        <MedicationModal
          initial={modalMed}
          onSave={saveMedication}
          onDelete={modalMed ? deleteMedication : undefined}
          onClose={() => setModalMed(undefined)}
        />
      )}

      {modalAppt !== undefined && (
        <AppointmentModal
          initial={modalAppt.appt}
          defaultDate={modalAppt.defaultDate}
          onSave={saveAppointment}
          onDelete={modalAppt.appt ? deleteAppointment : undefined}
          onClose={() => setModalAppt(undefined)}
        />
      )}

      {currentAlarm && (
        <AlarmOverlay
          occurrence={currentAlarm}
          onTake={() => resolveAlarm('taken')}
          onSkip={() => resolveAlarm('skipped')}
          onDismiss={() => snoozeDose(currentAlarm.key)}
        />
      )}

      {!currentAlarm && currentApptAlarm && (
        <AppointmentAlarmOverlay appointment={currentApptAlarm} onAcknowledge={acknowledgeApptAlarm} />
      )}
    </div>
    </LanguageProvider>
  )
}
