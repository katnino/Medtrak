import { CalendarDays, ListChecks, Sunrise } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export type View = 'today' | 'calendar' | 'medications'

interface Props {
  view: View
  onChange: (v: View) => void
  medicationCount: number
}

const items: { id: View; label: 'today' | 'calendar' | 'medications'; icon: typeof Sunrise }[] = [
  { id: 'today', label: 'today', icon: Sunrise },
  { id: 'calendar', label: 'calendar', icon: CalendarDays },
  { id: 'medications', label: 'medications', icon: ListChecks },
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
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors w-full text-left ${
                active
                  ? 'bg-surface text-ink'
                  : 'text-ink-dim hover:text-ink hover:bg-surface/60'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} className={active ? 'text-sage' : 'text-ink-faint group-hover:text-ink-dim'} />
              <span>{t(label)}</span>
            </button>
          )
        })}
      </nav>

      <div className="hidden md:block mt-auto px-6 py-6 text-xs text-ink-faint font-mono border-t border-hairline-soft">
        {t('activeMedications', { count: medicationCount, suffix: medicationCount === 1 ? '' : 's' })}
        <label className="mt-4 block">
          <span className="sr-only">{t('language')}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="w-full bg-void border border-hairline rounded px-2 py-1.5 text-xs text-ink-dim outline-none focus:border-sage-dim"
            aria-label={t('language')}
          >
            <option value="en">{t('english')}</option>
            <option value="sr-Latn">{t('serbianLatin')}</option>
          </select>
        </label>
      </div>
    </aside>
  )
}
