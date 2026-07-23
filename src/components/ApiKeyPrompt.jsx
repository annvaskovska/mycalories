import { useState } from 'react'

export default function ApiKeyPrompt({ onSave }) {
  const [key, setKey] = useState('')

  return (
    <div style={{ paddingTop: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em',
          color: 'var(--text-primary)', marginBottom: 4
        }}>
          Тарілка дня
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Щоденник харчування з оцінкою калорій
        </div>
      </div>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: 16
      }}>
        <label style={{
          display: 'block', fontSize: 12, fontWeight: 500,
          color: 'var(--text-secondary)', marginBottom: 6
        }}>
          Anthropic API ключ
        </label>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-ant-..."
          style={{
            width: '100%', padding: '7px 10px', fontSize: 13,
            fontVariantNumeric: 'tabular-nums', marginBottom: 8
          }}
        />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.4 }}>
          Ключ зберігається тільки локально у вашому браузері.
        </p>
        <button
          onClick={() => key.trim() && onSave(key.trim())}
          disabled={!key.trim()}
          style={{
            width: '100%', padding: 9, fontSize: 13, fontWeight: 500,
            background: key.trim() ? 'var(--accent)' : 'var(--border)',
            color: '#fff', borderRadius: 'var(--radius-sm)',
            transition: 'background 0.12s'
          }}
        >
          Зберегти та почати
        </button>
      </div>
    </div>
  )
}
