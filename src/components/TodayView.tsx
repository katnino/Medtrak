import { useState } from 'react'
import { Check, X as XIcon, Stethoscope } from 'lucide-react'
import type { Appointment, DoseOccurrence, DoseStatus } from '../types'
import DoseRing from './DoseRing'
import { useI18n } from '../lib/i18n'

interface Props {
  occurrences: DoseOccurrence[]
  appointments: Appointment[]
  now: Date
  onSetStatus: (key: string, status: DoseStatus) => void
  onEditAppointment: (appt: Appointment) => void
}

export default function TodayView({ occurrences, appointments, now, onSetStatus, onEditAppointment }: Props) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { locale, t } = useI18n()
  const dateLabel = now.toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <div className="mb-2">
        <span className="text-xs text-ink-faint font-mono uppercase tracking-widest">{dateLabel}</span>
      </div>
      <h1 className="font-display text-3xl text-ink mb-8">{t('today')}</h1>

      <div className="flex justify-center mb-10">
        <DoseRing occurrences={occurrences} now={now} onSelect={setSelectedKey} selectedKey={selectedKey} />
      </div>

      {occurrences.length === 0 ? (
        <p className="text-center text-sm text-ink-dim">{t('nothingScheduledToday')}</p>
      ) : (
        <div className="flex flex-col divide-y divide-hairline-soft border-t border-b border-hairline-soft">
          {occurrences.map((o) => {
            const isSelected = o.key === selectedKey
            return (
              <div
                key={o.key}
                onClick={() => setSelectedKey(o.key)}
                className={`flex items-center justify-between py-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-surface/60' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-ink-faint w-12 shrink-0">{o.time}</span>
                  <div>
                    <div
                      className={`text-sm ${
                        o.status === 'taken'
                          ? 'text-ink-dim line-through decoration-ink-faint'
                          : o.status === 'skipped'
                            ? 'text-ink-faint line-through decoration-ink-faint'
                            : 'text-ink'
                      }`}
                    >
                      {o.medication.name}
                    </div>
                    <div className="text-xs text-ink-faint font-mono mt-0.5">{o.medication.dosage}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {o.status === 'pending' ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSetStatus(o.key, 'skipped')
                        }}
                        className="h-8 w-8 rounded-full border border-hairline text-ink-faint hover:text-clay hover:border-clay-dim transition-colors flex items-center justify-center"
                        aria-label={t('skipDose')}
                      >
                        <XIcon size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSetStatus(o.key, 'taken')
                        }}
                        className="h-8 w-8 rounded-full border border-sage-dim text-sage hover:bg-sage-dim/20 transition-colors flex items-center justify-center"
                        aria-label={t('markTaken')}
                      >
                        <Check size={14} strokeWidth={1.5} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSetStatus(o.key, 'pending')
                      }}
                      className="text-xs text-ink-faint hover:text-ink-dim transition-colors font-mono"
                    >
                      {t('undo')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {appointments.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg text-ink mb-4">{t('appointmentsToday')}</h2>
          <div className="flex flex-col divide-y divide-hairline-soft border-t border-b border-hairline-soft">
            {appointments.map((appt) => (
              <button
                key={appt.id}
                onClick={() => onEditAppointment(appt)}
                className="flex items-center justify-between py-4 text-left group"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-ink-faint w-12 shrink-0">{appt.time}</span>
                  <div>
                    <div className="text-sm text-ink group-hover:text-dusk transition-colors">{appt.title}</div>
                    {(appt.provider || appt.location) && (
                      <div className="text-xs text-ink-faint font-mono mt-0.5">
                        {[appt.provider, appt.location].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
                <Stethoscope size={14} strokeWidth={1.5} className="text-ink-faint shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
