import { useMemo } from 'react'

function sumField(entries, field) {
  return entries.reduce((s, e) => s + (e[field] || 0), 0)
}

function ProgressRing({ current, target, color, fillColor, label, unit, size = 72 }) {
  const strokeWidth = 6
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const pct = target > 0 ? Math.min(current / target, 1) : 0
  const isOver = current > target && target > 0
  const offset = circumference * (1 - pct)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="var(--border-light)" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={isOver ? 'var(--danger)' : fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 500,
            color: isOver ? 'var(--danger)' : color, lineHeight: 1.1
          }}>
            {Math.round(current)}
          </span>
        </div>
      </div>
      <span style={{
        fontSize: '0.7rem', fontWeight: 600, color,
        textTransform: 'uppercase', letterSpacing: '0.04em'
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)'
      }}>
        {Math.round(current)}/{target}{unit}
      </span>
      {isOver && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          color: 'var(--danger)', fontWeight: 500
        }}>
          +{Math.round(current - target)}{unit} понад
        </span>
      )}
    </div>
  )
}

export default function DailyProgress({ entries, targets }) {
  const totals = useMemo(() => ({
    kcal: sumField(entries, 'kcal'),
    protein: sumField(entries, 'protein'),
    fat: sumField(entries, 'fat'),
    carbs: sumField(entries, 'carbs'),
  }), [entries])

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border-light)', padding: '20px 8px',
      marginBottom: 20, overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start'
      }}>
        <ProgressRing
          current={totals.kcal} target={targets.kcal}
          color="var(--cal-color)" fillColor="var(--cal-fill)"
          label="ккал" unit=""
        />
        <ProgressRing
          current={totals.protein} target={targets.protein}
          color="var(--protein-color)" fillColor="var(--protein-fill)"
          label="Білки" unit="г"
        />
        <ProgressRing
          current={totals.fat} target={targets.fat}
          color="var(--fat-color)" fillColor="var(--fat-fill)"
          label="Жири" unit="г"
        />
        <ProgressRing
          current={totals.carbs} target={targets.carbs}
          color="var(--carbs-color)" fillColor="var(--carbs-fill)"
          label="Вуглев." unit="г"
        />
      </div>
    </div>
  )
}
