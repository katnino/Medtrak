import { format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns'
import type { Appointment, DoseLog, DoseOccurrence, Medication } from '../types'

export function toDateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function medicationAppliesOnDate(med: Medication, dateKey: string): boolean {
  if (!med.active) return false
  const date = startOfDay(parseISO(dateKey))
  const start = startOfDay(parseISO(med.startDate))
  if (isBefore(date, start)) return false
  if (med.endDate) {
    const end = startOfDay(parseISO(med.endDate))
    if (isAfter(date, end)) return false
  }
  if (med.daysOfWeek.length === 0) return true
  return med.daysOfWeek.includes(date.getDay())
}

export function doseKey(medicationId: string, dateKey: string, time: string): string {
  return `${medicationId}__${dateKey}__${time}`
}

export function occurrencesForDate(
  medications: Medication[],
  logs: Record<string, DoseLog>,
  dateKey: string,
): DoseOccurrence[] {
  const out: DoseOccurrence[] = []
  for (const med of medications) {
    if (!medicationAppliesOnDate(med, dateKey)) continue
    for (const time of med.times) {
      const key = doseKey(med.id, dateKey, time)
      const log = logs[key]
      out.push({
        key,
        medication: med,
        date: dateKey,
        time,
        status: log?.status ?? 'pending',
      })
    }
  }
  return out.sort((a, b) => a.time.localeCompare(b.time))
}

export function adherenceForDate(
  medications: Medication[],
  logs: Record<string, DoseLog>,
  dateKey: string,
): { total: number; taken: number; skipped: number; pending: number } {
  const occ = occurrencesForDate(medications, logs, dateKey)
  return {
    total: occ.length,
    taken: occ.filter((o) => o.status === 'taken').length,
    skipped: occ.filter((o) => o.status === 'skipped').length,
    pending: occ.filter((o) => o.status === 'pending').length,
  }
}

export function appointmentsForDate(
  appointments: Appointment[],
  dateKey: string,
): Appointment[] {
  return appointments
    .filter((a) => a.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time))
}

export function isOccurrenceDue(dateKey: string, time: string, now: Date): boolean {
  const today = toDateKey(now)
  if (dateKey > today) return false
  if (dateKey < today) return true
  const [h, m] = time.split(':').map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return h * 60 + m <= nowMinutes
}
