import { useState } from 'react'

export default function Settings({ targets, onUpdate, apiKey, onApiKeyChange }) {
  const [draft, setDraft] = useState(targets)
  const [key, setKey] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onUpdate(draft)
    if (key.trim() !== apiKey) onApiKeyChange(key.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const fields = [
    { key: 'kcal', label: 'Калорії (ккал)' },
    { key: 'protein', label: 'Білки (г)' },
    { key: 'fat', label: 'Жири (г)' },
    { key: 'carbs', label: 'Вуглеводи (г)' },
  ]

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: 12, marginBottom: 12
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 10
      }}>
        Денні цілі
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 500,
              color: 'var(--text-secondary)', marginBottom: 4
            }}>
              {f.label}
            </label>
            <input
              type="number"
              value={draft[f.key]}
              onChange={e => setDraft({ ...draft, [f.key]: Number(e.target.value) || 0 })}
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{
          display: 'block', fontSize: 11, fontWeight: 500,
          color: 'var(--text-secondary)', marginBottom: 4
        }}>
          API ключ
        </label>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          style={{
            width: '100%', padding: '6px 8px', fontSize: 13,
            fontVariantNumeric: 'tabular-nums'
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          width: '100%', padding: 8, fontSize: 13, fontWeight: 500,
          background: saved ? '#16A34A' : 'var(--accent)',
          color: '#fff', borderRadius: 'var(--radius-sm)',
          transition: 'background 0.12s'
        }}
      >
        {saved ? 'Збережено' : 'Зберегти'}
      </button>
    </div>
  )
}
