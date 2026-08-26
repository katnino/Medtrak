import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, X as XIcon, Plus, Stethoscope } from 'lucide-react'
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import type { Appointment, DoseLog, DoseStatus, Medication } from '../types'
import { adherenceForDate, appointmentsForDate, occurrencesForDate, toDateKey } from '../lib/schedule'

interface Props {
  medications: Medication[]
  logs: Record<string, DoseLog>
  appointments: Appointment[]
  onSetStatus: (key: string, status: DoseStatus) => void
  onAddAppointment: (dateKey: string) => void
  onEditAppointment: (appt: Appointment) => void
}

export default function CalendarView({
  medications,
  logs,
  appointments,
  onSetStatus,
  onAddAppointment,
  onEditAppointment,
}: Props) {
  const [cursor, setCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()))

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor))
    const end = endOfWeek(endOfMonth(cursor))
    const out: Date[] = []
    let d = start
    while (d <= end) {
      out.push(d)
      d = new Date(d.getTime() + 86400000)
    }
    return out
  }, [cursor])

  const selectedOccurrences = occurrencesForDate(medications, logs, selectedDate)
  const selectedAppointments = appointmentsForDate(appointments, selectedDate)

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCursor((c) => addMonths(c, -1))}
            className="text-ink-faint hover:text-ink transition-colors p-1"
          >
            <ChevronLeft size={17} strokeWidth={1.5} />
          </button>
          <span className="text-sm text-ink-dim font-mono w-32 text-center">{format(cursor, 'MMMM yyyy')}</span>
          <button
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="text-ink-faint hover:text-ink transition-colors p-1"
          >
            <ChevronRight size={17} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-hairline-soft border border-hairline-soft rounded-lg overflow-hidden">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="bg-void text-center text-[11px] font-mono text-ink-faint py-2 uppercase">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = toDateKey(day)
          const inMonth = isSameMonth(day, cursor)
          const adherence = adherenceForDate(medications, logs, dateKey)
          const dayAppointments = appointmentsForDate(appointments, dateKey)
          const selected = dateKey === selectedDate

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className={`relative bg-void h-16 md:h-20 flex flex-col items-center justify-start pt-2 gap-1.5 transition-colors ${
                inMonth ? '' : 'opacity-30'
              } ${selected ? 'bg-surface' : 'hover:bg-surface/50'}`}
            >
              <span
                className={`text-xs font-mono h-5 w-5 flex items-center justify-center rounded-full ${
                  isToday(day) ? 'bg-dusk-dim/30 text-dusk' : 'text-ink-dim'
                }`}
              >
                {format(day, 'd')}
              </span>
              {adherence.total > 0 && (
                <div className="flex items-center gap-[3px]">
                  {Array.from({ length: Math.min(adherence.total, 4) }).map((_, i) => {
                    let color = 'bg-signal-red'
                    if (i < adherence.taken) color = 'bg-signal-green'
                    else if (i < adherence.taken + adherence.skipped) color = 'bg-clay-dim'
                    return <span key={i} className={`h-1 w-1 rounded-full ${color}`} />
                  })}
                </div>
              )}
              {dayAppointments.length > 0 && (
                <span className="h-1 w-1 rounded-full bg-signal-yellow" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-10">
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="font-display text-lg text-ink">
            {isSameDay(new Date(selectedDate + 'T00:00:00'), new Date()) ? 'Today' : format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d')}
          </h2>
        </div>

        {selectedOccurrences.length === 0 ? (
          <p className="text-sm text-ink-faint">Nothing scheduled.</p>
        ) : (
          <div className="flex flex-col divide-y divide-hairline-soft border-t border-b border-hairline-soft">
            {selectedOccurrences.map((o) => (
              <div key={o.key} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-ink-faint w-12 shrink-0">{o.time}</span>
                  <span
                    className={`text-sm ${
                      o.status === 'pending' ? 'text-ink' : 'text-ink-dim line-through decoration-ink-faint'
                    }`}
                  >
                    {o.medication.name}
                  </span>
                  <span className="text-xs text-ink-faint font-mono">{o.medication.dosage}</span>
                </div>
                <div className="flex items-center gap-2">
                  {o.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => onSetStatus(o.key, 'skipped')}
                        className="h-7 w-7 rounded-full border border-hairline text-ink-faint hover:text-clay hover:border-clay-dim transition-colors flex items-center justify-center"
                      >
                        <XIcon size={12} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => onSetStatus(o.key, 'taken')}
                        className="h-7 w-7 rounded-full border border-sage-dim text-sage hover:bg-sage-dim/20 transition-colors flex items-center justify-center"
                      >
                        <Check size={12} strokeWidth={1.5} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onSetStatus(o.key, 'pending')}
                      className="text-xs text-ink-faint hover:text-ink-dim transition-colors font-mono"
                    >
                      undo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink">Appointments</h2>
          <button
            onClick={() => onAddAppointment(selectedDate)}
            className="flex items-center gap-1.5 text-xs text-dusk hover:text-ink transition-colors"
          >
            <Plus size={13} strokeWidth={1.5} /> Add
          </button>
        </div>

        {selectedAppointments.length === 0 ? (
          <p className="text-sm text-ink-faint">No appointments this day.</p>
        ) : (
          <div className="flex flex-col divide-y divide-hairline-soft border-t border-b border-hairline-soft">
            {selectedAppointments.map((appt) => (
              <button
                key={appt.id}
                onClick={() => onEditAppointment(appt)}
                className="flex items-center justify-between py-3.5 text-left group"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-ink-faint w-12 shrink-0">{appt.time}</span>
                  <div>
                    <div className="text-sm text-ink group-hover:text-dusk transition-colors">{appt.title}</div>
                    {(appt.provider || appt.location) && (
                      <div className="text-xs text-ink-faint mt-0.5">
                        {[appt.provider, appt.location].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
                <Stethoscope size={14} strokeWidth={1.5} className="text-ink-faint shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
