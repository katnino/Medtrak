import type { DoseOccurrence } from '../types'

interface Props {
  occurrences: DoseOccurrence[]
  now: Date
  onSelect: (key: string) => void
  selectedKey: string | null
}

const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = 112

function timeToAngle(time: string): number {
  const [h, m] = time.split(':').map(Number)
  const fraction = (h * 60 + m) / (24 * 60)
  // start at top (12 o'clock = midnight), clockwise
  return fraction * 360 - 90
}

function pointOnRing(angleDeg: number, r = RADIUS) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  }
}

export default function DoseRing({ occurrences, now, onSelect, selectedKey }: Props) {
  const nowAngle = timeToAngle(`${now.getHours()}:${now.getMinutes()}`)
  const nowPoint = pointOnRing(nowAngle, RADIUS + 14)

  const taken = occurrences.filter((o) => o.status === 'taken').length
  const total = occurrences.length
  const nextDue = occurrences.find((o) => o.status === 'pending')

  // hour tick marks
  const ticks = Array.from({ length: 24 }, (_, h) => h).filter((h) => h % 3 === 0)

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

        {ticks.map((h) => {
          const p1 = pointOnRing(timeToAngle(`${h}:0`), RADIUS - 4)
          const p2 = pointOnRing(timeToAngle(`${h}:0`), RADIUS + 4)
          return (
            <line
              key={h}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="var(--color-ink-faint)"
              strokeWidth={1}
            />
          )
        })}

        {/* current time marker */}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={pointOnRing(nowAngle, RADIUS).x}
          y2={pointOnRing(nowAngle, RADIUS).y}
          stroke="var(--color-dusk)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        <circle cx={nowPoint.x} cy={nowPoint.y} r={2.5} fill="var(--color-dusk)" />

        {occurrences.map((o) => {
          const angle = timeToAngle(o.time)
          const p = pointOnRing(angle)
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
          {total === 0 ? 'No doses today' : `${taken} of ${total} taken`}
        </span>
        <span className="font-display text-2xl mt-2 leading-tight text-ink">
          {nextDue ? nextDue.medication.name : total > 0 ? 'All set' : ''}
        </span>
        {nextDue && (
          <span className="font-mono text-xs text-clay mt-1">{nextDue.time}</span>
        )}
      </div>
    </div>
  )
}
