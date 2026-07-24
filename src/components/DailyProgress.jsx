import { useMemo, useState, useEffect } from 'react'

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

function MacroCard({ label, current, target, unit, color, bgColor, onClick }) {
  const isOver = current > target && target > 0
  return (
    <button
      onClick={onClick}
      style={{
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)',
        padding: 10, textAlign: 'left', width: '100%',
        background: 'none', cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = bgColor
        e.currentTarget.style.borderColor = color
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'none'
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
      }}
      onMouseDown={e => e.currentTarget.style.opacity = '0.8'}
      onMouseUp={e => e.currentTarget.style.opacity = '1'}
    >
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
    </button>
  )
}

function MacroBreakdownModal({ label, field, color, entries, total, onClose }) {
  const sorted = useMemo(() =>
    entries
      .filter(e => (e[field] || 0) > 0)
      .sort((a, b) => (b[field] || 0) - (a[field] || 0)),
    [entries, field]
  )

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-page)', borderRadius: 12,
          width: '100%', maxWidth: 420, maxHeight: '70vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 10px', borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 3, background: color
            }} />
            <span style={{
              fontSize: 14, fontWeight: 500, color: 'var(--text-primary)'
            }}>
              {label} — {Math.round(total)} г
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)', transition: 'color 0.12s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '4px 16px 16px' }}>
          {sorted.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '24px 0',
              color: 'var(--text-muted)', fontSize: 12
            }}>
              Немає записів з цим макронутрієнтом
            </div>
          ) : (
            sorted.map(entry => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid var(--border-subtle)'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: 500, wordBreak: 'break-word'
                  }}>
                    {entry.name}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums', marginTop: 1
                  }}>
                    {entry.time}
                  </div>
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 600, color,
                  fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 12
                }}>
                  {entry[field]} г
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const MACROS = [
  { label: 'Білки', field: 'protein', color: 'var(--macro-protein)', bgColor: 'var(--macro-protein-bg)' },
  { label: 'Жири', field: 'fat', color: 'var(--macro-fat)', bgColor: 'var(--macro-fat-bg)' },
  { label: 'Вуглеводи', field: 'carbs', color: 'var(--macro-carbs)', bgColor: 'var(--macro-carbs-bg)' },
]

export default function DailyProgress({ entries, targets }) {
  const [activeMacro, setActiveMacro] = useState(null)

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
        {MACROS.map(m => (
          <MacroCard
            key={m.field}
            label={m.label}
            current={totals[m.field]} target={targets[m.field]}
            unit="г" color={m.color} bgColor={m.bgColor}
            onClick={() => setActiveMacro(m)}
          />
        ))}
      </div>

      {activeMacro && (
        <MacroBreakdownModal
          label={activeMacro.label}
          field={activeMacro.field}
          color={activeMacro.color}
          entries={entries}
          total={totals[activeMacro.field]}
          onClose={() => setActiveMacro(null)}
        />
      )}
    </div>
  )
}
