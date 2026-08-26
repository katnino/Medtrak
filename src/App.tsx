import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar, { type View } from './components/Sidebar'
import TodayView from './components/TodayView'
import CalendarView from './components/CalendarView'
import MedicationsView from './components/MedicationsView'
import MedicationModal from './components/MedicationModal'
import AppointmentModal from './components/AppointmentModal'
import AlarmOverlay from './components/AlarmOverlay'
import AppointmentAlarmOverlay from './components/AppointmentAlarmOverlay'
import { useLocalStorage } from './lib/storage'
import { appointmentsForDate, occurrencesForDate, toDateKey } from './lib/schedule'
import { playChime, requestNotificationPermission, sendBrowserNotification } from './lib/notify'
import { syncLocalNotifications } from './lib/localNotifications'
import type { Appointment, DoseLog, DoseOccurrence, DoseStatus, Medication } from './types'

export default function App() {
  const [view, setView] = useState<View>('today')
  const [medications, setMedications] = useLocalStorage<Medication[]>('medtrak.medications', [])
  const [logs, setLogs] = useLocalStorage<Record<string, DoseLog>>('medtrak.logs', {})
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('medtrak.appointments', [])
  const [firedAlarms, setFiredAlarms] = useLocalStorage<Record<string, boolean>>('medtrak.fired', {})

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
    void syncLocalNotifications(medications, logs, appointments)
  }, [medications, logs, appointments])

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
        (o) => o.status === 'pending' && o.time <= nowHM && !firedAlarms[o.key] && !alarmingKeys.current.has(o.key),
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
          sendBrowserNotification(`${o.medication.name} — ${o.medication.dosage}`, `Scheduled for ${o.time}`)
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
          sendBrowserNotification(a.title, [a.provider, a.location].filter(Boolean).join(' · ') || `At ${a.time}`)
        })
        playChime()
      }
    }

    check()
    const id = setInterval(check, 20_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medications, logs, appointments, firedAlarms])

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

  const dismissAlarm = () => {
    if (!currentAlarm) return
    // allow it to re-fire on the next check cycle
    setFiredAlarms((prev) => {
      const next = { ...prev }
      delete next[currentAlarm.key]
      return next
    })
    setAlarmQueue((q) => q.slice(1))
  }

  const acknowledgeApptAlarm = () => {
    if (!currentApptAlarm) return
    setApptAlarmQueue((q) => q.slice(1))
  }

  return (
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
          onDismiss={dismissAlarm}
        />
      )}

      {!currentAlarm && currentApptAlarm && (
        <AppointmentAlarmOverlay appointment={currentApptAlarm} onAcknowledge={acknowledgeApptAlarm} />
      )}
    </div>
  )
}
