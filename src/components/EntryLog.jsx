export default function EntryLog({ entries, onDelete }) {
  if (entries.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 16px',
        color: 'var(--text-muted)', fontSize: '0.9rem'
      }}>
        Записів ще немає. Опишіть що ви їли вище.
      </div>
    )
  }

  return (
    <div>
      <div style={{
        fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10
      }}>
        Записи за день
      </div>

      {entries.map((entry) => (
        <div key={entry.id} style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border-light)', padding: '12px 14px',
          marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, wordBreak: 'break-word' }}>
                {entry.name}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: 'var(--text-muted)', flexShrink: 0
              }}>
                {entry.time}
              </span>
            </div>
            <div style={{
              display: 'flex', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.75rem'
            }}>
              <span style={{ color: 'var(--cal-color)' }}>
                {entry.kcal} ккал
              </span>
              <span style={{ color: 'var(--protein-color)' }}>
                Б {entry.protein}
              </span>
              <span style={{ color: 'var(--fat-color)' }}>
                Ж {entry.fat}
              </span>
              <span style={{ color: 'var(--carbs-color)' }}>
                В {entry.carbs}
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(entry.id)}
            style={{
              width: 28, height: 28, fontSize: '0.75rem',
              color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
