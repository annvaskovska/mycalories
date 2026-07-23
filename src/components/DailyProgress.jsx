import { useMemo } from 'react'

function sumField(entries, field) {
  return entries.reduce((s, e) => s + (e[field] || 0), 0)
}

function ProgressBar({ current, target, trackColor, fillColor }) {
  const pct = target > 0 ? Math.min(current / target, 1) : 0
  return (
    <div style={{
      height: 4, borderRadius: 2, background: trackColor, width: '100%', overflow: 'hidden'
    }}>
      <div style={{
        height: '100%', borderRadius: 2, background: fillColor,
        width: `${pct * 100}%`, transition: 'width 0.3s ease'
      }} />
    </div>
  )
}

function MacroCard({ label, current, target, unit, color, bgColor }) {
  const isOver = current > target && target > 0
  return (
    <div style={{
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)',
      padding: 10
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0
        }} />
        <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums', marginBottom: 6
      }}>
        {Math.round(current)}/{target}{unit}
      </div>
      <ProgressBar
        current={current}
        target={target}
        trackColor={bgColor}
        fillColor={color}
      />
      {isOver && (
        <div style={{
          fontSize: 9.5, color, fontWeight: 500, marginTop: 4,
          fontVariantNumeric: 'tabular-nums'
        }}>
          +{Math.round(current - target)}{unit} понад
        </div>
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
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10
      }}>
        <span style={{
          fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums',
          lineHeight: 1
        }}>
          {Math.round(totals.kcal)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          / {targets.kcal} ккал
        </span>
      </div>
      <ProgressBar
        current={totals.kcal}
        target={targets.kcal}
        trackColor="var(--border-subtle)"
        fillColor="var(--accent)"
      />
      {totals.kcal > targets.kcal && (
        <div style={{
          fontSize: 9.5, color: 'var(--accent)', fontWeight: 500, marginTop: 4,
          fontVariantNumeric: 'tabular-nums'
        }}>
          +{Math.round(totals.kcal - targets.kcal)} ккал понад
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, marginTop: 12
      }}>
        <MacroCard
          label="Білки"
          current={totals.protein} target={targets.protein}
          unit="г" color="var(--macro-protein)" bgColor="var(--macro-protein-bg)"
        />
        <MacroCard
          label="Жири"
          current={totals.fat} target={targets.fat}
          unit="г" color="var(--macro-fat)" bgColor="var(--macro-fat-bg)"
        />
        <MacroCard
          label="Вуглеводи"
          current={totals.carbs} target={targets.carbs}
          unit="г" color="var(--macro-carbs)" bgColor="var(--macro-carbs-bg)"
        />
      </div>
    </div>
  )
}
