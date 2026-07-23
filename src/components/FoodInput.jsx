import { useState } from 'react'

const SYSTEM_PROMPT = `You are a nutrition estimation assistant. The user sends a free-text description of food they ate (in any language — often Ukrainian). Your job:
1. Parse it into individual food items. Keep dishes that are naturally eaten together as one item (e.g. "spaghetti with grilled sausage" = 1 item). Don't merge unrelated items.
2. For each item, estimate calories (kcal), protein (g), fat (g), carbs (g) using reasonable standard portion sizes when quantities aren't specified.
3. Return ONLY a JSON array, no markdown fences, no explanation:
[{"name": "item name", "kcal": number, "protein": number, "fat": number, "carbs": number}]
Keep item names in the same language the user wrote them in. Round numbers to integers.`

export default function FoodInput({ apiKey, onEstimated, disabled }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: text.trim() }],
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`API ${res.status}: ${errBody.slice(0, 200)}`)
      }

      const data = await res.json()
      const content = data.content?.[0]?.text || ''
      const items = JSON.parse(content)

      if (!Array.isArray(items)) throw new Error('Відповідь не є масивом')

      onEstimated(items)
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border-light)', padding: 16, marginBottom: 16
    }}>
      <label style={{
        display: 'block', fontSize: '0.8rem', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        color: 'var(--text-muted)', marginBottom: 8
      }}>
        Що ви їли?
      </label>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={disabled || loading}
        placeholder="яєчня, скибка сиру, помідор / капучино / спагеті з ковбаскою гриль"
        rows={3}
        style={{
          width: '100%', padding: '10px 12px', fontSize: '0.9rem',
          borderRadius: 'var(--radius-sm)', resize: 'vertical',
          border: '1px solid var(--border)', background: disabled ? 'var(--bg)' : 'var(--bg-card)'
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading || disabled}
          style={{
            flex: 1, padding: '11px 16px', fontSize: '0.9rem', fontWeight: 600,
            background: (!text.trim() || loading || disabled) ? 'var(--border)' : 'var(--accent)',
            color: '#fff', borderRadius: 'var(--radius-sm)',
            transition: 'background 0.15s', position: 'relative'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Spinner /> Оцінюю…
            </span>
          ) : 'Оцінити'}
        </button>
      </div>
      {error && (
        <div style={{
          marginTop: 10, padding: '10px 12px', fontSize: '0.82rem',
          background: '#f5e6e3', color: '#8a4a3d', borderRadius: 'var(--radius-sm)',
          border: '1px solid #e8cfc9'
        }}>
          <div style={{ marginBottom: 6 }}>{error}</div>
          <button
            onClick={handleSubmit}
            style={{
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)',
              textDecoration: 'underline', textUnderlineOffset: 2
            }}
          >
            Спробувати ще раз
          </button>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{
      animation: 'spin 0.8s linear infinite'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
