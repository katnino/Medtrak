import { Plus, Clock, Pill } from 'lucide-react'
import type { Medication } from '../types'

interface Props {
  medications: Medication[]
  onAdd: () => void
  onEdit: (med: Medication) => void
}

function dayLabel(days: number[]): string {
  if (days.length === 0) return 'Every day'
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days.map((d) => labels[d]).join(', ')
}

export default function MedicationsView({ medications, onAdd, onEdit }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Medications</h1>
          <p className="text-sm text-ink-dim mt-1.5">Everything you take, and when.</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-sm bg-sage-dim/20 border border-sage-dim text-sage hover:bg-sage-dim/30 transition-colors px-4 py-2.5 rounded-md shrink-0"
        >
          <Plus size={15} strokeWidth={1.5} /> Add
        </button>
      </div>

      {medications.length === 0 ? (
        <div className="border border-dashed border-hairline rounded-lg py-16 text-center">
          <Pill size={22} strokeWidth={1.25} className="mx-auto text-ink-faint mb-3" />
          <p className="text-sm text-ink-dim">No medications yet.</p>
          <button onClick={onAdd} className="text-sm text-sage hover:text-ink mt-2 transition-colors">
            Add your first one
          </button>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-hairline-soft border-t border-b border-hairline-soft">
          {medications.map((med) => (
            <button
              key={med.id}
              onClick={() => onEdit(med)}
              className={`flex items-center justify-between py-5 text-left group ${
                med.active ? '' : 'opacity-45'
              }`}
            >
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-lg text-ink group-hover:text-sage transition-colors">
                    {med.name}
                  </span>
                  <span className="text-xs text-ink-dim font-mono">{med.dosage}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-faint mt-1.5">
                  <Clock size={11} strokeWidth={1.5} />
                  <span className="font-mono">{med.times.join(' · ')}</span>
                  <span className="mx-1">—</span>
                  <span>{dayLabel(med.daysOfWeek)}</span>
                </div>
              </div>
              <span className="text-xs text-ink-faint capitalize font-mono">{med.form}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
