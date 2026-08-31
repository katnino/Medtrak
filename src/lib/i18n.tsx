import { createContext, useContext, type ReactNode } from 'react'

export type Language = 'en' | 'sr-Latn' | 'de' | 'fr' | 'it'

const translations = {
  en: {
    language: 'Language', english: 'English', serbianLatin: 'Srpski (latinica)', german: 'Deutsch', french: 'Français', italian: 'Italiano',
    today: 'Today', calendar: 'Calendar', medications: 'Medications', medicationTracker: 'medication tracker',
    nothingScheduledToday: 'Nothing scheduled for today.',
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
    // Settings & Enhanced Reminders
    settings: 'Settings',
    enhancedReminders: 'Enhanced Reminders',
    enhancedRemindersDesc: 'When enabled, medication reminders will show a full-screen alarm with voice announcement on Android.',
    enhancedRemindersEnabled: 'Enabled',
    enhancedRemindersDisabled: 'Disabled',
    permissionRequired: 'Permission required',
    permissionGranted: 'Permission granted',
    permissionDenied: 'Permission denied',
    requestPermission: 'Request Permission',
    openSettings: 'Open Settings',
    exactAlarmsPermission: 'Exact Alarms',
    notificationsPermission: 'Notifications',
  },
  'sr-Latn': {
    language: 'Jezik', english: 'English', serbianLatin: 'Srpski (latinica)', german: 'Deutsch', french: 'Français', italian: 'Italiano',
    today: 'Danas', calendar: 'Kalendar', medications: 'Lekovi', medicationTracker: 'praćenje lekova',
    nothingScheduledToday: 'Danas nema zakazanih obaveza.',
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
    // Settings & Enhanced Reminders
    settings: 'Podešavanja',
    enhancedReminders: 'Napredni podsetnici',
    enhancedRemindersDesc: 'Kada je uključeno, podsetnici za lekove će prikazivati punoekranski alarm sa glasovnom porukom na Androidu.',
    enhancedRemindersEnabled: 'Uključeno',
    enhancedRemindersDisabled: 'Isključeno',
    permissionRequired: 'Potrebna dozvola',
    permissionGranted: 'Dozvola odobrena',
    permissionDenied: 'Dozvola odbijena',
    requestPermission: 'Zatraži dozvolu',
    openSettings: 'Otvori podešavanja',
    exactAlarmsPermission: 'Tačni alarmi',
    notificationsPermission: 'Obaveštenja',
  },
  de: {
    language: 'Sprache', english: 'English', serbianLatin: 'Serbisch (Latein)', german: 'Deutsch', french: 'Français', italian: 'Italiano',
    today: 'Heute', calendar: 'Kalender', medications: 'Medikamente', medicationTracker: 'Medikamenten-Tracker',
    nothingScheduledToday: 'Heute ist nichts geplant.',
    nothingScheduled: 'Nichts geplant.', appointments: 'Termine', appointmentsToday: 'Termine heute',
    noAppointmentsThisDay: 'An diesem Tag keine Termine.', add: 'Hinzufügen', undo: 'rückgängig', skipDose: 'Dosis überspringen', markTaken: 'Als genommen markieren',
    noDosesToday: 'Heute keine Dosen', dosesTaken: '{taken} von {total} genommen', allSet: 'Alles erledigt',
    everythingYouTake: 'Alles, was du nimmst – und wann.', noMedications: 'Noch keine Medikamente.', addFirstMedication: 'Füge dein erstes hinzu',
    everyDay: 'Jeden Tag', selectedDaysOnly: 'Nur ausgewählte Tage',
    addMedication: 'Medikament hinzufügen', editMedication: 'Medikament bearbeiten', name: 'Name', dosage: 'Dosierung', form: 'Darreichungsform',
    reminderTimes: 'Erinnerungszeiten', removeTime: 'Zeit entfernen', addAnotherTime: 'Weitere Zeit hinzufügen', repeatsOn: 'Wiederholt am',
    startDate: 'Startdatum', endDateOptional: 'Enddatum (optional)', notesOptional: 'Notizen (optional)',
    medicationNameExample: 'z. B. Lisinopril', dosageExample: 'z. B. 10 mg', appointmentExample: 'z. B. Kontrolle beim Kardiologen',
    doctorExample: 'z. B. Dr. Marić', locationExample: 'z. B. Stadtklinik, Raum 4',
    medicationNotesPlaceholder: 'Zu den Mahlzeiten einnehmen, Grapefruit meiden usw.', activeReminder: 'Aktiv – in Erinnerungen und Kalender einbeziehen',
    deleteMedication: 'Medikament löschen', cancel: 'Abbrechen', saveChanges: 'Änderungen speichern',
    addAppointment: 'Termin hinzufügen', editAppointment: 'Termin bearbeiten', whatFor: 'Wofür', doctorClinic: 'Arzt / Klinik',
    location: 'Ort', date: 'Datum', time: 'Uhrzeit', appointmentNotesPlaceholder: 'Versicherungskarte mitbringen, nüchtern erscheinen usw.',
    remindMe: 'Erinnere mich zur entsprechenden Zeit', deleteAppointment: 'Termin löschen', appointment: 'Termin', gotIt: 'Verstanden',
    timeToTake: 'Zeit zur Einnahme', skip: 'Überspringen', remindInTen: 'erinnere mich in 10 Min',
    medicationDue: 'Medikament fällig: {name}', scheduledFor: 'Geplant für {time}', medicationReminders: 'Medikamenten-Erinnerungen',
    medicationReminderDescription: 'Zeitkritische Erinnerungen zur Medikamenteneinnahme', snoozeMinutes: 'Schlummern {minutes} Min', atTime: 'Um {time}',
    formPill: 'Tablette', formCapsule: 'Kapsel', formLiquid: 'Flüssigkeit', formInjection: 'Injektion', formDrops: 'Tropfen', formOther: 'anderes',
    // Settings & Enhanced Reminders
    settings: 'Einstellungen',
    enhancedReminders: 'Erweiterte Erinnerungen',
    enhancedRemindersDesc: 'Wenn aktiviert, zeigen Medikamenten-Erinnerungen einen Vollbild-Alarm mit Sprachansage unter Android.',
    enhancedRemindersEnabled: 'Aktiviert',
    enhancedRemindersDisabled: 'Deaktiviert',
    permissionRequired: 'Berechtigung erforderlich',
    permissionGranted: 'Berechtigung erteilt',
    permissionDenied: 'Berechtigung verweigert',
    requestPermission: 'Berechtigung anfordern',
    openSettings: 'Einstellungen öffnen',
    exactAlarmsPermission: 'Exakte Wecker',
    notificationsPermission: 'Benachrichtigungen',
  },
  fr: {
    language: 'Langue', english: 'English', serbianLatin: 'Serbe (latin)', german: 'Deutsch', french: 'Français', italian: 'Italiano',
    today: "Aujourd'hui", calendar: 'Calendrier', medications: 'Médicaments', medicationTracker: 'suivi des médicaments',
    nothingScheduledToday: "Rien de planifié aujourd'hui.",
    nothingScheduled: 'Rien de planifié.', appointments: 'Rendez-vous', appointmentsToday: 'Rendez-vous du jour',
    noAppointmentsThisDay: 'Aucun rendez-vous ce jour.', add: 'Ajouter', undo: 'annuler', skipDose: 'Ignorer la dose', markTaken: 'Marquer comme pris',
    noDosesToday: 'Aucune dose aujourd’hui', dosesTaken: '{taken} sur {total} pris', allSet: 'C’est fait',
    everythingYouTake: 'Tout ce que vous prenez, et quand.', noMedications: 'Aucun médicament pour le moment.', addFirstMedication: 'Ajoutez le premier',
    everyDay: 'Tous les jours', selectedDaysOnly: 'Jours sélectionnés uniquement',
    addMedication: 'Ajouter un médicament', editMedication: 'Modifier le médicament', name: 'Nom', dosage: 'Posologie', form: 'Forme',
    reminderTimes: 'Heures de rappel', removeTime: 'Retirer l’heure', addAnotherTime: 'Ajouter une autre heure', repeatsOn: 'Se répète le',
    startDate: 'Date de début', endDateOptional: 'Date de fin (optionnelle)', notesOptional: 'Notes (optionnelles)',
    medicationNameExample: 'ex. Lisinopril', dosageExample: 'ex. 10 mg', appointmentExample: 'ex. Suivi chez le cardiologue',
    doctorExample: 'ex. Dr Marić', locationExample: 'ex. Clinique municipale, salle 4',
    medicationNotesPlaceholder: 'Prendre avec un repas, éviter le pamplemousse, etc.', activeReminder: 'Actif — inclus dans les rappels et le calendrier',
    deleteMedication: 'Supprimer le médicament', cancel: 'Annuler', saveChanges: 'Enregistrer',
    addAppointment: 'Ajouter un rendez-vous', editAppointment: 'Modifier le rendez-vous', whatFor: 'À propos de', doctorClinic: 'Médecin / clinique',
    location: 'Lieu', date: 'Date', time: 'Heure', appointmentNotesPlaceholder: 'Apporter la carte d’assurance, être à jeun, etc.',
    remindMe: 'Rappelle-moi à l’heure', deleteAppointment: 'Supprimer le rendez-vous', appointment: 'rendez-vous', gotIt: 'Compris',
    timeToTake: 'heure de prise', skip: 'Ignorer', remindInTen: 'rappelle-moi dans 10 min',
    medicationDue: 'Médicament à prendre : {name}', scheduledFor: 'Prévu pour {time}', medicationReminders: 'Rappels de médicaments',
    medicationReminderDescription: 'Rappels ponctuels pour prendre les médicaments', snoozeMinutes: 'Reporter {minutes} min', atTime: 'À {time}',
    formPill: 'comprimé', formCapsule: 'gélule', formLiquid: 'liquide', formInjection: 'injection', formDrops: 'gouttes', formOther: 'autre',
    // Settings & Enhanced Reminders
    settings: 'Paramètres',
    enhancedReminders: 'Rappels avancés',
    enhancedRemindersDesc: 'Lorsque cette option est activée, les rappels de médicaments affichent une alarme en plein écran avec annonce vocale sous Android.',
    enhancedRemindersEnabled: 'Activé',
    enhancedRemindersDisabled: 'Désactivé',
    permissionRequired: 'Autorisation requise',
    permissionGranted: 'Autorisation accordée',
    permissionDenied: 'Autorisation refusée',
    requestPermission: 'Demander l’autorisation',
    openSettings: 'Ouvrir les paramètres',
    exactAlarmsPermission: 'Alarmes exactes',
    notificationsPermission: 'Notifications',
  },
  it: {
    language: 'Lingua', english: 'English', serbianLatin: 'Serbo (latino)', german: 'Deutsch', french: 'Français', italian: 'Italiano',
    today: 'Oggi', calendar: 'Calendario', medications: 'Farmaci', medicationTracker: 'gestore di farmaci',
    nothingScheduledToday: 'Niente in programma per oggi.',
    nothingScheduled: 'Niente in programma.', appointments: 'Appuntamenti', appointmentsToday: 'Appuntamenti di oggi',
    noAppointmentsThisDay: 'Nessun appuntamento in questo giorno.', add: 'Aggiungi', undo: 'annulla', skipDose: 'Salta dose', markTaken: 'Segna come assunto',
    noDosesToday: 'Nessuna dose oggi', dosesTaken: '{taken} di {total} assunte', allSet: 'Tutto fatto',
    everythingYouTake: 'Tutto ciò che assumi, e quando.', noMedications: 'Nessun farmaco ancora.', addFirstMedication: 'Aggiungi il primo',
    everyDay: 'Ogni giorno', selectedDaysOnly: 'Solo i giorni selezionati',
    addMedication: 'Aggiungi farmaco', editMedication: 'Modifica farmaco', name: 'Nome', dosage: 'Dosaggio', form: 'Forma',
    reminderTimes: 'Orari di promemoria', removeTime: 'Rimuovi orario', addAnotherTime: 'Aggiungi un altro orario', repeatsOn: 'Si ripete il',
    startDate: 'Data di inizio', endDateOptional: 'Data di fine (opzionale)', notesOptional: 'Note (opzionali)',
    medicationNameExample: 'es. Lisinopril', dosageExample: 'es. 10 mg', appointmentExample: 'es. Controllo dal cardiologo',
    doctorExample: 'es. Dr. Marić', locationExample: 'es. Clinica cittadina, stanza 4',
    medicationNotesPlaceholder: 'Assumere con il cibo, evitare il pompelmo, ecc.', activeReminder: 'Attivo — includi in promemoria e calendario',
    deleteMedication: 'Elimina farmaco', cancel: 'Annulla', saveChanges: 'Salva modifiche',
    addAppointment: 'Aggiungi appuntamento', editAppointment: 'Modifica appuntamento', whatFor: 'Per cosa', doctorClinic: 'Medico / clinica',
    location: 'Luogo', date: 'Data', time: 'Ora', appointmentNotesPlaceholder: 'Portare la tessera sanitaria, essere a digiuno, ecc.',
    remindMe: 'Promemoria all’ora giusta', deleteAppointment: 'Elimina appuntamento', appointment: 'appuntamento', gotIt: 'Ho capito',
    timeToTake: 'ora di assunzione', skip: 'Salta', remindInTen: 'promemoria tra 10 min',
    medicationDue: 'Farmaco da assumere: {name}', scheduledFor: 'Previsto per {time}', medicationReminders: 'Promemoria farmaci',
    medicationReminderDescription: 'Promemoria tempestivi per assumere i farmaci', snoozeMinutes: 'Posponi {minutes} min', atTime: 'Alle {time}',
    formPill: 'pasticca', formCapsule: 'capsula', formLiquid: 'liquido', formInjection: 'iniezione', formDrops: 'gocce', formOther: 'altro',
    // Settings & Enhanced Reminders
    settings: 'Impostazioni',
    enhancedReminders: 'Promemoria avanzati',
    enhancedRemindersDesc: 'Se attivi, i promemoria dei farmaci mostrano un allarme a tutto schermo con annuncio vocale su Android.',
    enhancedRemindersEnabled: 'Attivato',
    enhancedRemindersDisabled: 'Disattivato',
    permissionRequired: 'Autorizzazione richiesta',
    permissionGranted: 'Autorizzazione concessa',
    permissionDenied: 'Autorizzazione negata',
    requestPermission: 'Richiedi autorizzazione',
    openSettings: 'Apri impostazioni',
    exactAlarmsPermission: 'Sveglie esatte',
    notificationsPermission: 'Notifiche',
  },
} as const

type TranslationKey = keyof typeof translations.en

export function translate(language: Language, key: TranslationKey, values: Record<string, string | number> = {}): string {
  return translations[language][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`))
}

// Per-language locale + calendar-week configuration.
// - `locale` drives Intl.DateTimeFormat (dates/weekdays) and Intl.PluralRules.
// - `weekStartsOn` (0 = Sunday, 1 = Monday) and `firstDay` keep the calendar
//   grid and the weekday header row aligned. The en/sr-Latn values preserve the
//   previous behaviour exactly; de/fr/it use a Monday-based week.
export const localeConfig: Record<Language, { locale: string; weekStartsOn: 0 | 1; firstDay: number }> = {
  en: { locale: 'en-US', weekStartsOn: 0, firstDay: 1 },
  'sr-Latn': { locale: 'sr-Latn-RS', weekStartsOn: 1, firstDay: 2 },
  de: { locale: 'de-DE', weekStartsOn: 1, firstDay: 2 },
  fr: { locale: 'fr-FR', weekStartsOn: 1, firstDay: 2 },
  it: { locale: 'it-IT', weekStartsOn: 1, firstDay: 2 },
}

// Stable display order for the language picker.
export const LANGUAGES: Language[] = ['en', 'sr-Latn', 'de', 'fr', 'it']

// Translation key holding each language's own name (autonym), so the picker
// always shows e.g. "Deutsch" / "Français" / "Italiano" regardless of UI language.
const languageLabelKey: Record<Language, TranslationKey> = {
  en: 'english',
  'sr-Latn': 'serbianLatin',
  de: 'german',
  fr: 'french',
  it: 'italian',
}

export function languageName(language: Language): string {
  return translate(language, languageLabelKey[language])
}

// "N active medications" needs correct plural forms per language, which the
// simple {suffix} trick could not express for German/Italian. Resolved via the
// CLDR plural rules so every language gets grammatically correct output.
const activeMedicationForms: Record<Language, { one: string; other: string }> = {
  en: { one: '{count} active medication', other: '{count} active medications' },
  'sr-Latn': { one: 'Aktivni lekovi: {count}', other: 'Aktivni lekovi: {count}' },
  de: { one: '{count} aktives Medikament', other: '{count} aktive Medikamente' },
  fr: { one: '{count} médicament actif', other: '{count} médicaments actifs' },
  it: { one: '{count} medicinale attivo', other: '{count} medicinali attivi' },
}

export function activeMedicationsLabel(language: Language, count: number): string {
  const rule = new Intl.PluralRules(localeConfig[language].locale).select(count)
  return activeMedicationForms[language][rule === 'one' ? 'one' : 'other'].replace('{count}', String(count))
}

type I18n = {
  language: Language
  locale: string
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
  setLanguage: (language: Language) => void
}

const I18nContext = createContext<I18n | null>(null)

export function LanguageProvider({ language, setLanguage, children }: Pick<I18n, 'language' | 'setLanguage'> & { children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ language, setLanguage, locale: localeConfig[language].locale, t: (key, values) => translate(language, key, values) }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18n {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside LanguageProvider')
  return context
}
