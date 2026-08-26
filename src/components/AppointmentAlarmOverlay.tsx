import { CalendarClock } from 'lucide-react'
import type { Appointment } from '../types'
import { useI18n } from '../lib/i18n'

interface Props {
  appointment: Appointment
  onAcknowledge: () => void
}

export default function AppointmentAlarmOverlay({ appointment, onAcknowledge }: Props) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-void/85 backdrop-blur-md animate-fade-in px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto h-14 w-14 rounded-full border border-dusk-dim flex items-center justify-center mb-6">
          <CalendarClock size={20} strokeWidth={1.5} className="text-dusk" />
        </div>
        <span className="text-xs font-mono text-ink-faint uppercase tracking-widest">
          {appointment.time} — {t('appointment')}
        </span>
        <h2 className="font-display text-3xl text-ink mt-3">{appointment.title}</h2>
        {(appointment.provider || appointment.location) && (
          <p className="text-sm text-ink-dim mt-1.5">
            {[appointment.provider, appointment.location].filter(Boolean).join(' · ')}
          </p>
        )}
        {appointment.notes && (
          <p className="text-xs text-ink-faint mt-3 max-w-xs mx-auto">{appointment.notes}</p>
        )}

        <div className="flex items-center justify-center mt-9">
          <button
            onClick={onAcknowledge}
            className="flex items-center gap-2 text-sm border border-dusk-dim bg-dusk-dim/15 text-dusk hover:bg-dusk-dim/25 transition-colors px-6 py-2.5 rounded-full"
          >
            {t('gotIt')}
          </button>
        </div>
      </div>
    </div>
  )
}
