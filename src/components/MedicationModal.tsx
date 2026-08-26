import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Medication } from '../types'
import { toDateKey } from '../lib/schedule'

interface Props {
  initial: Medication | null
  onSave: (med: Medication) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

const FORMS: Medication['form'][] = ['pill', 'capsule', 'liquid', 'injection', 'drops', 'other']
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function blankMedication(): Medication {
  return {
    id: crypto.randomUUID(),
    name: '',
    dosage: '',
    form: 'pill',
    times: ['08:00'],
    daysOfWeek: [],
    startDate: toDateKey(new Date()),
    endDate: null,
    notes: '',
    active: true,
    createdAt: Date.now(),
  }
}

export default function MedicationModal({ initial, onSave, onDelete, onClose }: Props) {
  const [med, setMed] = useState<Medication>(initial ?? blankMedication())
  const isNew = !initial

  const updateTime = (idx: number, value: string) => {
    setMed((m) => ({ ...m, times: m.times.map((t, i) => (i === idx ? value : t)) }))
  }
  const addTime = () => setMed((m) => ({ ...m, times: [...m.times, '08:00'] }))
  const removeTime = (idx: number) =>
    setMed((m) => ({ ...m, times: m.times.filter((_, i) => i !== idx) }))

  const toggleDay = (d: number) => {
    setMed((m) => ({
      ...m,
      daysOfWeek: m.daysOfWeek.includes(d)
        ? m.daysOfWeek.filter((x) => x !== d)
        : [...m.daysOfWeek, d].sort(),
    }))
  }

  const valid = med.name.trim().length > 0 && med.times.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-void/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full md:max-w-lg md:rounded-xl rounded-t-xl bg-surface border border-hairline max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline-soft sticky top-0 bg-surface">
          <h2 className="font-display text-xl text-ink">{isNew ? 'Add medication' : 'Edit medication'}</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">Name</label>
            <input
              value={med.name}
              onChange={(e) => setMed((m) => ({ ...m, name: e.target.value }))}
              placeholder="e.g. Lisinopril"
              className="bg-void border border-hairline rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-sage-dim outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">Dosage</label>
              <input
                value={med.dosage}
                onChange={(e) => setMed((m) => ({ ...m, dosage: e.target.value }))}
                placeholder="e.g. 10mg"
                className="bg-void border border-hairline rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-sage-dim outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">Form</label>
              <select
                value={med.form}
                onChange={(e) => setMed((m) => ({ ...m, form: e.target.value as Medication['form'] }))}
                className="bg-void border border-hairline rounded-md px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-dim capitalize"
              >
                {FORMS.map((f) => (
                  <option key={f} value={f} className="bg-surface">
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">Reminder times</label>
            {med.times.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="time"
                  value={t}
                  onChange={(e) => updateTime(idx, e.target.value)}
                  className="bg-void border border-hairline rounded-md px-3 py-2 text-sm text-ink font-mono outline-none focus:border-sage-dim flex-1"
                />
                {med.times.length > 1 && (
                  <button
                    onClick={() => removeTime(idx)}
                    className="text-ink-faint hover:text-clay transition-colors p-1.5"
                    aria-label="Remove time"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTime}
              className="self-start flex items-center gap-1.5 text-xs text-sage hover:text-ink transition-colors mt-1"
            >
              <Plus size={13} strokeWidth={1.5} /> Add another time
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">Repeats on</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((label, d) => {
                const on = med.daysOfWeek.includes(d)
                return (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`h-8 w-8 rounded-full text-xs font-mono transition-colors border ${
                      on
                        ? 'bg-sage-dim/20 border-sage-dim text-sage'
                        : 'border-hairline text-ink-faint hover:text-ink-dim'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <span className="text-xs text-ink-faint">
              {med.daysOfWeek.length === 0 ? 'Every day' : 'Selected days only'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">Start date</label>
              <input
                type="date"
                value={med.startDate}
                onChange={(e) => setMed((m) => ({ ...m, startDate: e.target.value }))}
                className="bg-void border border-hairline rounded-md px-3 py-2 text-sm text-ink font-mono outline-none focus:border-sage-dim"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">End date (optional)</label>
              <input
                type="date"
                value={med.endDate ?? ''}
                onChange={(e) => setMed((m) => ({ ...m, endDate: e.target.value || null }))}
                className="bg-void border border-hairline rounded-md px-3 py-2 text-sm text-ink font-mono outline-none focus:border-sage-dim"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ink-dim font-mono uppercase tracking-wide">Notes (optional)</label>
            <textarea
              value={med.notes}
              onChange={(e) => setMed((m) => ({ ...m, notes: e.target.value }))}
              rows={2}
              placeholder="Take with food, avoid grapefruit, etc."
              className="bg-void border border-hairline rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-sage-dim resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink-dim">
            <input
              type="checkbox"
              checked={med.active}
              onChange={(e) => setMed((m) => ({ ...m, active: e.target.checked }))}
              className="accent-[var(--color-sage-dim)]"
            />
            Active — include in reminders and calendar
          </label>
        </div>

        <div className="flex items-center justify-between px-6 py-5 border-t border-hairline-soft sticky bottom-0 bg-surface">
          {!isNew && onDelete ? (
            <button
              onClick={() => onDelete(med.id)}
              className="text-xs text-clay hover:text-ink transition-colors"
            >
              Delete medication
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-sm text-ink-dim hover:text-ink transition-colors px-3 py-2">
              Cancel
            </button>
            <button
              disabled={!valid}
              onClick={() => onSave(med)}
              className="text-sm bg-sage-dim/25 border border-sage-dim text-sage hover:bg-sage-dim/35 transition-colors px-4 py-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isNew ? 'Add medication' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
