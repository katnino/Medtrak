import { CalendarDays, ListChecks, Sunrise, Settings } from 'lucide-react'
import { useI18n, LANGUAGES, languageName, activeMedicationsLabel } from '../lib/i18n'

export type View = 'today' | 'calendar' | 'medications' | 'settings'

interface Props {
  view: View
  onChange: (v: View) => void
  medicationCount: number
}

const items: { id: View; label: 'today' | 'calendar' | 'medications' | 'settings'; icon: typeof Sunrise }[] = [
  { id: 'today', label: 'today', icon: Sunrise },
  { id: 'calendar', label: 'calendar', icon: CalendarDays },
  { id: 'medications', label: 'medications', icon: ListChecks },
  { id: 'settings', label: 'settings', icon: Settings },
]

export default function Sidebar({ view, onChange, medicationCount }: Props) {
  const { language, setLanguage, t } = useI18n()
  return (
    <aside className="w-full md:w-60 shrink-0 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-hairline bg-void flex md:flex-col">
      <div className="px-6 pt-8 pb-6 hidden md:block">
        <div className="font-display text-[22px] tracking-tight text-ink">Medtrak</div>
        <div className="text-xs text-ink-faint mt-1 font-mono">{t('medicationTracker')}</div>
      </div>

      <nav className="flex md:flex-col flex-1 md:flex-none px-2 md:px-3 py-2 md:py-0 gap-1">
        {items.map(({ id, label, icon: Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`group flex flex-1 md:flex-none items-center gap-0 md:gap-3 px-2 md:px-4 py-2.5 rounded-md text-xs md:text-sm transition-colors md:w-full text-center md:text-left ${
                active
                  ? 'bg-surface text-ink'
                  : 'text-ink-dim hover:text-ink hover:bg-surface/60'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} className={`hidden md:block ${active ? 'text-sage' : 'text-ink-faint group-hover:text-ink-dim'}`} />
              <span className="truncate">{t(label)}</span>
            </button>
          )
        })}
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as typeof language)}
          className="flex-1 md:hidden px-2 py-2.5 rounded-md text-xs transition-colors text-ink-dim bg-void border border-hairline outline-none focus:border-sage-dim"
          aria-label={t('language')}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{languageName(lang)}</option>
          ))}
        </select>
      </nav>

      <div className="hidden md:block mt-auto px-6 py-6 text-xs text-ink-faint font-mono border-t border-hairline-soft">
        {activeMedicationsLabel(language, medicationCount)}
        <label className="mt-4 block">
          <span className="sr-only">{t('language')}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="w-full bg-void border border-hairline rounded px-2 py-1.5 text-xs text-ink-dim outline-none focus:border-sage-dim"
            aria-label={t('language')}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{languageName(lang)}</option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  )
}
