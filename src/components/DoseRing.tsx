import type { DoseOccurrence } from '../types'
import { useI18n } from '../lib/i18n'

interface Props {
  occurrences: DoseOccurrence[]
  now: Date
  onSelect: (key: string) => void
  selectedKey: string | null
}

const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = 112
// PM doses live on an inner dial so 09:00 and 21:00 share a clock position
// without sharing a point.
const PM_RADIUS = RADIUS - 26

function timeToAngle(time: string): number {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m
  const fraction = totalMinutes / (24 * 60)
  // 12-hour clock face: one revolution = 12h. 09:00 and 21:00 both sit at
  // the 9 o'clock position; the ring (AM/PM) tells them apart.
  return (fraction * 720 + 270) % 360
}

function isPM(time: string): boolean {
  return Number(time.split(':')[0]) >= 12
}

function pointOnRing(angleDeg: number, r = RADIUS) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  }
}

export default function DoseRing({ occurrences, now, onSelect, selectedKey }: Props) {
  const { t } = useI18n()
  const nowTime = `${now.getHours()}:${now.getMinutes()}`
  const nowAngle = timeToAngle(nowTime)
  const nowRadius = isPM(nowTime) ? PM_RADIUS : RADIUS
  const nowPoint = pointOnRing(nowAngle, nowRadius + 14)

  const taken = occurrences.filter((o) => o.status === 'taken').length
  const total = occurrences.length
  const nextDue = occurrences.find((o) => o.status === 'pending')

  // hour tick marks — 12, 3, 6, 9 on both dials
  const ticks = [0, 3, 6, 9]

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={1}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={PM_RADIUS}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={1}
        />

        {ticks.map((h) => {
          const angle = timeToAngle(`${h}:0`)
          const amOuter = pointOnRing(angle, RADIUS - 4)
          const amInner = pointOnRing(angle, RADIUS + 4)
          const pmOuter = pointOnRing(angle, PM_RADIUS - 3)
          const pmInner = pointOnRing(angle, PM_RADIUS + 3)
          return (
            <g key={h}>
              <line
                x1={amOuter.x}
                y1={amOuter.y}
                x2={amInner.x}
                y2={amInner.y}
                stroke="var(--color-ink-faint)"
                strokeWidth={1}
              />
              <line
                x1={pmOuter.x}
                y1={pmOuter.y}
                x2={pmInner.x}
                y2={pmInner.y}
                stroke="var(--color-ink-faint)"
                strokeWidth={1}
              />
            </g>
          )
        })}

        {/* current time marker — ends on the AM or PM dial */}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={pointOnRing(nowAngle, nowRadius).x}
          y2={pointOnRing(nowAngle, nowRadius).y}
          stroke="var(--color-dusk)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        <circle cx={nowPoint.x} cy={nowPoint.y} r={2.5} fill="var(--color-dusk)" />

        {occurrences.map((o) => {
          const angle = timeToAngle(o.time)
          const p = pointOnRing(angle, isPM(o.time) ? PM_RADIUS : RADIUS)
          const isSelected = o.key === selectedKey
          const isDueNow = o.status === 'pending' && o.time <= `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

          const fill =
            o.status === 'taken'
              ? 'var(--color-sage)'
              : o.status === 'skipped'
                ? 'var(--color-void)'
                : isDueNow
                  ? 'var(--color-clay)'
                  : 'var(--color-surface-raised)'

          const stroke =
            o.status === 'skipped' ? 'var(--color-ink-faint)' : isDueNow ? 'var(--color-clay)' : 'var(--color-ink-dim)'

          return (
            <g
              key={o.key}
              onClick={() => onSelect(o.key)}
              className="cursor-pointer"
            >
              {isDueNow && (
                <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="var(--color-clay)" strokeWidth={1} opacity={0.5} />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 7 : 5.5}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.2}
              />
            </g>
          )
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-16">
        <span className="font-mono text-[11px] tracking-widest text-ink-dim uppercase">
          {total === 0 ? t('noDosesToday') : t('dosesTaken', { taken, total })}
        </span>
        <span className="font-display text-2xl mt-2 leading-tight text-ink">
          {nextDue ? nextDue.medication.name : total > 0 ? t('allSet') : ''}
        </span>
        {nextDue && (
          <span className="font-mono text-xs text-clay mt-1">{nextDue.time}</span>
        )}
      </div>
    </div>
  )
}
