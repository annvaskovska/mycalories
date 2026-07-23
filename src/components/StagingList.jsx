function CloseIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export default function StagingList({ items, onChange, onConfirm, onCancel }) {
  const updateItem = (idx, field, value) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, [field]: field === 'name' ? value : Number(value) || 0 } : item
    )
    onChange(updated)
  }

  const deleteItem = (idx) => {
    const updated = items.filter((_, i) => i !== idx)
    if (updated.length === 0) { onCancel(); return }
    onChange(updated)
  }

  return (
    <div style={{
      borderRadius: 'var(--radius)', marginBottom: 16,
      border: '1px solid var(--accent)', padding: 12
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.04em', color: 'var(--accent)', marginBottom: 10
      }}>
        Перевірте оцінку
      </div>

      {items.map((item, idx) => (
        <div key={idx} style={{
          padding: '8px 0',
          borderTop: idx > 0 ? '1px solid var(--border-subtle)' : 'none'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6
          }}>
            <input
              type="text"
              value={item.name}
              onChange={e => updateItem(idx, 'name', e.target.value)}
              style={{
                flex: 1, padding: '5px 8px', fontSize: 12.5, fontWeight: 500,
                border: '1px solid var(--border-subtle)'
              }}
            />
            <button
              onClick={() => deleteItem(idx)}
              style={{
                width: 22, height: 22,
                color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CloseIcon size={10} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <MacroField label="ккал" value={item.kcal}
              onChange={v => updateItem(idx, 'kcal', v)} />
            <MacroField label="Б" value={item.protein}
              onChange={v => updateItem(idx, 'protein', v)} />
            <MacroField label="Ж" value={item.fat}
              onChange={v => updateItem(idx, 'fat', v)} />
            <MacroField label="В" value={item.carbs}
              onChange={v => updateItem(idx, 'carbs', v)} />
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: 8, fontSize: 12.5, fontWeight: 500,
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)'
          }}
        >
          Скасувати
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 2, padding: 8, fontSize: 13, fontWeight: 500,
            background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)'
          }}
        >
          Додати до щоденника
        </button>
      </div>
    </div>
  )
}

function MacroField({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        fontSize: 11, color: 'var(--text-muted)',
        minWidth: 20, textAlign: 'right'
      }}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 56, fontSize: 12, padding: '4px 6px' }}
      />
    </div>
  )
}
