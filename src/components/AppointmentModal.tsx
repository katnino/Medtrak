import { useState } from 'react'
import { X } from 'lucide-react'
import type { Appointment } from '../types'
import { useI18n } from '../lib/i18n'

interface Props {
  initial: Appointment | null
  defaultDate: string
  onSave: (appt: Appointment) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

function blankAppointment(defaultDate: string): Appointment {
  return {
    id: crypto.randomUUID(),
    title: '',
    provider: '',
    location: '',
    date: defaultDate,
    time: '09:00',
    notes: '',
    reminder: true,
    createdAt: Date.now(),
  }
}

export default function AppointmentModal({ initial, defaultDate, onSave, onDelete, onClose }: Props) {
  const { t } = useI18n()
  const [appt, setAppt] = useState<Appointment>(initial ?? blankAppointment(defaultDate))
  const isNew = !initial
  const valid = appt.title.trim().length > 0 && appt.date.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-void/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full md:max-w-lg md:rounded-xl rounded-t-xl bg-surface border border-hairline max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline-soft sticky top-0 bg-surface">
          <h2 className="font-display text-xl text-ink">{isNew ? t('addAppointment') : t('editAppointment')}</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">{t('whatFor')}</label>
            <input
              value={appt.title}
              onChange={(e) => setAppt((a) => ({ ...a, title: e.target.value }))}
              placeholder={t('appointmentExample')}
              className="bg-void border border-hairline rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-dusk-dim outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">{t('doctorClinic')}</label>
              <input
                value={appt.provider}
                onChange={(e) => setAppt((a) => ({ ...a, provider: e.target.value }))}
                placeholder={t('doctorExample')}
                className="bg-void border border-hairline rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-dusk-dim outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">{t('location')}</label>
              <input
                value={appt.location}
                onChange={(e) => setAppt((a) => ({ ...a, location: e.target.value }))}
                placeholder={t('locationExample')}
                className="bg-void border border-hairline rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-dusk-dim outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">{t('date')}</label>
              <input
                type="date"
                value={appt.date}
                onChange={(e) => setAppt((a) => ({ ...a, date: e.target.value }))}
                className="bg-void border border-hairline rounded-md px-3 py-2 text-sm text-ink font-mono outline-none focus:border-dusk-dim"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">{t('time')}</label>
              <input
                type="time"
                value={appt.time}
                onChange={(e) => setAppt((a) => ({ ...a, time: e.target.value }))}
                className="bg-void border border-hairline rounded-md px-3 py-2 text-sm text-ink font-mono outline-none focus:border-dusk-dim"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">{t('notesOptional')}</label>
            <textarea
              value={appt.notes}
              onChange={(e) => setAppt((a) => ({ ...a, notes: e.target.value }))}
              rows={2}
              placeholder={t('appointmentNotesPlaceholder')}
              className="bg-void border border-hairline rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-dusk-dim resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink-dim">
            <input
              type="checkbox"
              checked={appt.reminder}
              onChange={(e) => setAppt((a) => ({ ...a, reminder: e.target.checked }))}
              className="accent-[var(--color-dusk-dim)]"
            />
            {t('remindMe')}
          </label>
        </div>

        <div className="flex items-center justify-between px-6 py-5 border-t border-hairline-soft sticky bottom-0 bg-surface">
          {!isNew && onDelete ? (
            <button
              onClick={() => onDelete(appt.id)}
              className="text-xs text-clay hover:text-ink transition-colors"
            >
              {t('deleteAppointment')}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-sm text-ink-dim hover:text-ink transition-colors px-3 py-2">
              {t('cancel')}
            </button>
            <button
              disabled={!valid}
              onClick={() => onSave(appt)}
              className="text-sm bg-dusk-dim/25 border border-dusk-dim text-dusk hover:bg-dusk-dim/35 transition-colors px-4 py-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isNew ? t('addAppointment') : t('saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
