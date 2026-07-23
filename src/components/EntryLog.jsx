function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export default function EntryLog({ entries, onDelete }) {
  if (entries.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '28px 16px',
        color: 'var(--text-muted)', fontSize: 12
      }}>
        Записів ще немає. Опишіть що ви їли вище.
      </div>
    )
  }

  return (
    <div>
      <div style={{
        fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 4
      }}>
        Записи за день
      </div>

      {entries.map((entry, idx) => (
        <div key={entry.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '10px 0',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, wordBreak: 'break-word' }}>
                {entry.name}
              </span>
              <span style={{
                fontSize: 11, color: 'var(--text-muted)', flexShrink: 0,
                fontVariantNumeric: 'tabular-nums'
              }}>
                {entry.time}
              </span>
            </div>
            <div style={{
              display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)',
              fontVariantNumeric: 'tabular-nums'
            }}>
              <span>{entry.kcal} ккал</span>
              <span style={{ color: 'var(--macro-protein)' }}>Б {entry.protein}</span>
              <span style={{ color: 'var(--macro-fat)' }}>Ж {entry.fat}</span>
              <span style={{ color: 'var(--macro-carbs)' }}>В {entry.carbs}</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(entry.id)}
            style={{
              width: 22, height: 22, marginTop: 2,
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, borderRadius: 'var(--radius-sm)',
              transition: 'color 0.12s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  )
}
