export type DoseStatus = 'pending' | 'taken' | 'skipped'

export interface Medication {
  id: string
  name: string
  dosage: string
  form: 'pill' | 'capsule' | 'liquid' | 'injection' | 'drops' | 'other'
  times: string[] // "HH:mm" 24h
  daysOfWeek: number[] // 0=Sun..6=Sat, empty = every day
  startDate: string // yyyy-mm-dd
  endDate: string | null
  notes: string
  active: boolean
  createdAt: number
}

export interface DoseLog {
  // key: `${medicationId}__${date}__${time}`
  key: string
  medicationId: string
  date: string // yyyy-mm-dd
  time: string // HH:mm
  status: DoseStatus
  actedAt: number | null
}

export interface DoseOccurrence {
  key: string
  medication: Medication
  date: string
  time: string
  status: DoseStatus
}

export interface Appointment {
  id: string
  title: string // e.g. "Cardiologist follow-up"
  provider: string // doctor / clinic name, optional
  location: string
  date: string // yyyy-mm-dd
  time: string // HH:mm
  notes: string
  reminder: boolean // whether this should trigger an alarm at start time
  createdAt: number
}
