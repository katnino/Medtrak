import { createContext, useContext, type ReactNode } from 'react'

export type Language = 'en' | 'sr-Latn'

const translations = {
  en: {
    language: 'Language', english: 'English', serbianLatin: 'Srpski (latinica)',
    today: 'Today', calendar: 'Calendar', medications: 'Medications', medicationTracker: 'medication tracker',
    activeMedications: '{count} active medication{suffix}', nothingScheduledToday: 'Nothing scheduled for today.',
    nothingScheduled: 'Nothing scheduled.', appointments: 'Appointments', appointmentsToday: 'Appointments today',
    noAppointmentsThisDay: 'No appointments this day.', add: 'Add', undo: 'undo', skipDose: 'Skip dose', markTaken: 'Mark taken',
    noDosesToday: 'No doses today', dosesTaken: '{taken} of {total} taken', allSet: 'All set',
    everythingYouTake: 'Everything you take, and when.', noMedications: 'No medications yet.', addFirstMedication: 'Add your first one',
    everyDay: 'Every day', selectedDaysOnly: 'Selected days only',
    addMedication: 'Add medication', editMedication: 'Edit medication', name: 'Name', dosage: 'Dosage', form: 'Form',
    reminderTimes: 'Reminder times', removeTime: 'Remove time', addAnotherTime: 'Add another time', repeatsOn: 'Repeats on',
    startDate: 'Start date', endDateOptional: 'End date (optional)', notesOptional: 'Notes (optional)',
    medicationNameExample: 'e.g. Lisinopril', dosageExample: 'e.g. 10 mg', appointmentExample: 'e.g. Cardiologist follow-up',
    doctorExample: 'e.g. Dr. Marić', locationExample: 'e.g. City Clinic, Room 4',
    medicationNotesPlaceholder: 'Take with food, avoid grapefruit, etc.', activeReminder: 'Active — include in reminders and calendar',
    deleteMedication: 'Delete medication', cancel: 'Cancel', saveChanges: 'Save changes',
    addAppointment: 'Add appointment', editAppointment: 'Edit appointment', whatFor: 'What for', doctorClinic: 'Doctor / clinic',
    location: 'Location', date: 'Date', time: 'Time', appointmentNotesPlaceholder: 'Bring insurance card, fasting required, etc.',
    remindMe: "Remind me when it's time", deleteAppointment: 'Delete appointment', appointment: 'appointment', gotIt: 'Got it',
    timeToTake: 'time to take', skip: 'Skip', remindInTen: 'remind me in 10 min',
    medicationDue: 'Medication due: {name}', scheduledFor: 'Scheduled for {time}', medicationReminders: 'Medication reminders',
    medicationReminderDescription: 'Time-sensitive reminders to take medication', snoozeMinutes: 'Snooze {minutes} min', atTime: 'At {time}',
    formPill: 'pill', formCapsule: 'capsule', formLiquid: 'liquid', formInjection: 'injection', formDrops: 'drops', formOther: 'other',
  },
  'sr-Latn': {
    language: 'Jezik', english: 'English', serbianLatin: 'Srpski (latinica)',
    today: 'Danas', calendar: 'Kalendar', medications: 'Lekovi', medicationTracker: 'praćenje lekova',
    activeMedications: 'Aktivni lekovi: {count}', nothingScheduledToday: 'Danas nema zakazanih obaveza.',
    nothingScheduled: 'Nema zakazanih obaveza.', appointments: 'Termini', appointmentsToday: 'Današnji termini',
    noAppointmentsThisDay: 'Nema termina ovog dana.', add: 'Dodaj', undo: 'poništi', skipDose: 'Preskoči dozu', markTaken: 'Označi kao uzeto',
    noDosesToday: 'Nema doza danas', dosesTaken: 'Uzeto {taken} od {total}', allSet: 'Sve je završeno',
    everythingYouTake: 'Sve što uzimate i kada.', noMedications: 'Još nema lekova.', addFirstMedication: 'Dodajte prvi lek',
    everyDay: 'Svaki dan', selectedDaysOnly: 'Samo izabrani dani',
    addMedication: 'Dodaj lek', editMedication: 'Izmeni lek', name: 'Naziv', dosage: 'Doza', form: 'Oblik',
    reminderTimes: 'Vreme podsetnika', removeTime: 'Ukloni vreme', addAnotherTime: 'Dodaj drugo vreme', repeatsOn: 'Ponavlja se',
    startDate: 'Datum početka', endDateOptional: 'Datum završetka (opciono)', notesOptional: 'Beleške (opciono)',
    medicationNameExample: 'npr. Lizinopril', dosageExample: 'npr. 10 mg', appointmentExample: 'npr. Kontrola kod kardiologa',
    doctorExample: 'npr. dr Marić', locationExample: 'npr. Gradska ambulanta, soba 4',
    medicationNotesPlaceholder: 'Uzmite uz hranu, izbegavajte grejpfrut itd.', activeReminder: 'Aktivno — uključi u podsetnike i kalendar',
    deleteMedication: 'Obriši lek', cancel: 'Otkaži', saveChanges: 'Sačuvaj izmene',
    addAppointment: 'Dodaj termin', editAppointment: 'Izmeni termin', whatFor: 'Svrha termina', doctorClinic: 'Lekar / ordinacija',
    location: 'Lokacija', date: 'Datum', time: 'Vreme', appointmentNotesPlaceholder: 'Ponesite zdravstvenu knjižicu, dođite natašte itd.',
    remindMe: 'Podseti me kada dođe vreme', deleteAppointment: 'Obriši termin', appointment: 'termin', gotIt: 'Razumem',
    timeToTake: 'vreme je za uzimanje', skip: 'Preskoči', remindInTen: 'podseti me za 10 min',
    medicationDue: 'Vreme je za lek: {name}', scheduledFor: 'Zakazano za {time}', medicationReminders: 'Podsetnici za lekove',
    medicationReminderDescription: 'Pravovremeni podsetnici za uzimanje lekova', snoozeMinutes: 'Odloži {minutes} min', atTime: 'U {time}',
    formPill: 'tableta', formCapsule: 'kapsula', formLiquid: 'tečnost', formInjection: 'injekcija', formDrops: 'kapi', formOther: 'ostalo',
  },
} as const

type TranslationKey = keyof typeof translations.en

export function translate(language: Language, key: TranslationKey, values: Record<string, string | number> = {}): string {
  return translations[language][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`))
}

type I18n = {
  language: Language
  locale: 'en-US' | 'sr-Latn-RS'
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
  setLanguage: (language: Language) => void
}

const I18nContext = createContext<I18n | null>(null)

export function LanguageProvider({ language, setLanguage, children }: Pick<I18n, 'language' | 'setLanguage'> & { children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ language, setLanguage, locale: language === 'en' ? 'en-US' : 'sr-Latn-RS', t: (key, values) => translate(language, key, values) }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18n {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside LanguageProvider')
  return context
}
