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
    { key: 'kcal', label: 'Калорії (ккал)', color: 'var(--cal-color)' },
    { key: 'protein', label: 'Білки (г)', color: 'var(--protein-color)' },
    { key: 'fat', label: 'Жири (г)', color: 'var(--fat-color)' },
    { key: 'carbs', label: 'Вуглеводи (г)', color: 'var(--carbs-color)' },
  ]

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border-light)', padding: 16, marginBottom: 16
    }}>
      <div style={{
        fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 14
      }}>
        Денні цілі
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 500,
              color: f.color, marginBottom: 4
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

      <div style={{ marginBottom: 14 }}>
        <label style={{
          display: 'block', fontSize: '0.75rem', fontWeight: 500,
          color: 'var(--text-muted)', marginBottom: 4
        }}>
          API ключ
        </label>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          style={{
            width: '100%', padding: '8px 10px', fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)'
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          width: '100%', padding: '10px', fontSize: '0.85rem', fontWeight: 600,
          background: saved ? 'var(--carbs-color)' : 'var(--text)',
          color: '#fff', borderRadius: 'var(--radius-sm)',
          transition: 'background 0.15s'
        }}
      >
        {saved ? 'Збережено ✓' : 'Зберегти'}
      </button>
    </div>
  )
}
