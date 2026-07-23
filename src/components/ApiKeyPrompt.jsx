import { useState } from 'react'

export default function ApiKeyPrompt({ onSave }) {
  const [key, setKey] = useState('')

  return (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700,
        marginBottom: 8, color: 'var(--text)'
      }}>
        Тарілка дня
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.95rem' }}>
        Щоденник харчування з оцінкою калорій
      </p>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border-light)', padding: 24, textAlign: 'left'
      }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>
          Anthropic API ключ
        </label>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-ant-..."
          style={{
            width: '100%', padding: '10px 12px', fontSize: '0.9rem',
            fontFamily: 'var(--font-mono)', marginBottom: 16
          }}
        />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Ключ зберігається тільки локально у вашому браузері.
        </p>
        <button
          onClick={() => key.trim() && onSave(key.trim())}
          disabled={!key.trim()}
          style={{
            width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 600,
            background: key.trim() ? 'var(--accent)' : 'var(--border)',
            color: '#fff', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s'
          }}
        >
          Зберегти та почати
        </button>
      </div>
    </div>
  )
}
