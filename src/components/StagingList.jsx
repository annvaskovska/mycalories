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
      background: 'var(--bg-card)', borderRadius: 'var(--radius)',
      border: '2px solid var(--accent)', padding: 16, marginBottom: 16
    }}>
      <div style={{
        fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 12
      }}>
        Перевірте оцінку
      </div>

      {items.map((item, idx) => (
        <div key={idx} style={{
          padding: '10px 0',
          borderBottom: idx < items.length - 1 ? '1px solid var(--border-light)' : 'none'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <input
              type="text"
              value={item.name}
              onChange={e => updateItem(idx, 'name', e.target.value)}
              style={{
                flex: 1, padding: '6px 8px', fontSize: '0.9rem', fontWeight: 500,
                border: '1px solid var(--border-light)', marginRight: 8
              }}
            />
            <button
              onClick={() => deleteItem(idx)}
              style={{
                width: 30, height: 30, fontSize: '0.85rem',
                color: 'var(--danger)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <MacroField label="ккал" value={item.kcal} color="var(--cal-color)"
              onChange={v => updateItem(idx, 'kcal', v)} />
            <MacroField label="Б" value={item.protein} color="var(--protein-color)"
              onChange={v => updateItem(idx, 'protein', v)} />
            <MacroField label="Ж" value={item.fat} color="var(--fat-color)"
              onChange={v => updateItem(idx, 'fat', v)} />
            <MacroField label="В" value={item.carbs} color="var(--carbs-color)"
              onChange={v => updateItem(idx, 'carbs', v)} />
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '10px', fontSize: '0.85rem', fontWeight: 500,
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'var(--text-muted)'
          }}
        >
          Скасувати
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 2, padding: '10px', fontSize: '0.9rem', fontWeight: 600,
            background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)'
          }}
        >
          Додати до щоденника
        </button>
      </div>
    </div>
  )
}

function MacroField({ label, value, color, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        fontSize: '0.7rem', fontWeight: 600, color,
        minWidth: 24, textAlign: 'right'
      }}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 60 }}
      />
    </div>
  )
}
