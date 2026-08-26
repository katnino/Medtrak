import { Check, X as XIcon, BellRing } from 'lucide-react'
import type { DoseOccurrence } from '../types'
import { useI18n } from '../lib/i18n'

interface Props {
  occurrence: DoseOccurrence
  onTake: () => void
  onSkip: () => void
  onDismiss: () => void
}

export default function AlarmOverlay({ occurrence, onTake, onSkip, onDismiss }: Props) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-void/85 backdrop-blur-md animate-fade-in px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto h-14 w-14 rounded-full border border-clay-dim flex items-center justify-center mb-6 animate-pulse-ring">
          <BellRing size={20} strokeWidth={1.5} className="text-clay" />
        </div>
        <span className="text-xs font-mono text-ink-faint uppercase tracking-widest">
          {occurrence.time} — {t('timeToTake')}
        </span>
        <h2 className="font-display text-3xl text-ink mt-3">{occurrence.medication.name}</h2>
        <p className="text-sm text-ink-dim mt-1.5">{occurrence.medication.dosage}</p>
        {occurrence.medication.notes && (
          <p className="text-xs text-ink-faint mt-3 max-w-xs mx-auto">{occurrence.medication.notes}</p>
        )}

        <div className="flex items-center justify-center gap-3 mt-9">
          <button
            onClick={onSkip}
            className="flex items-center gap-2 text-sm border border-hairline text-ink-dim hover:text-clay hover:border-clay-dim transition-colors px-5 py-2.5 rounded-full"
          >
            <XIcon size={14} strokeWidth={1.5} /> {t('skip')}
          </button>
          <button
            onClick={onTake}
            className="flex items-center gap-2 text-sm border border-sage-dim bg-sage-dim/15 text-sage hover:bg-sage-dim/25 transition-colors px-5 py-2.5 rounded-full"
          >
            <Check size={14} strokeWidth={1.5} /> {t('markTaken')}
          </button>
        </div>

        <button
          onClick={onDismiss}
          className="text-xs text-ink-faint hover:text-ink-dim transition-colors mt-6 font-mono"
        >
          {t('remindInTen')}
        </button>
      </div>
    </div>
  )
}
