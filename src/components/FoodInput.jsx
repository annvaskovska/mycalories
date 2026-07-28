import { useState } from 'react'

const SYSTEM_PROMPT = `You are a nutrition estimation assistant. The user sends a free-text description of food they ate (in any language — often Ukrainian). Your job:
1. Parse it into individual food items. Keep dishes that are naturally eaten together as one item (e.g. "spaghetti with grilled sausage" = 1 item). Don't merge unrelated items.
2. For each item, estimate calories (kcal), protein (g), fat (g), carbs (g). Calibrate the estimate this way:
   - When quantities aren't specified, default to standard/moderate home portions — not generous, restaurant-, or buffet-sized ones.
   - Assume ingredients are Polish-market products/brands unless the user says otherwise, and use realistic Polish package sizes (e.g. a "kaiser roll" = Polish kajzerka ≈ 40–50 g; a cheese slice ≈ 15–20 g).
   - When a specific branded or clearly implied packaged product is named, prefer its known packaged-product nutrition data over a generic category estimate.
   - You get one text input and must return one final answer — never ask a clarifying question. Resolve ambiguous or missing quantities silently, always choosing the conservative (smaller) plausible amount.
3. Return ONLY a JSON array, no markdown fences, no explanation:
[{"name": "item name", "kcal": number, "protein": number, "fat": number, "carbs": number}]
Keep item names in the same language the user wrote them in. When an item is a composite of several ingredients, state the assumed quantity for each inside the "name" field so the user can see what you assumed (e.g. "кайзерка з Almette і помідором — assumed ½ kajzerka ~25g, Almette ~20g, помідор 2 thin slices ~10g"). Round numbers to integers.`

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
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, color: 'var(--text-secondary)',
        marginBottom: 6
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
          width: '100%', padding: '8px 10px', fontSize: 13,
          borderRadius: 'var(--radius-sm)', resize: 'vertical',
          border: '1px solid var(--border)',
          background: disabled ? 'var(--bg-card)' : 'var(--bg-page)',
          lineHeight: 1.45
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading || disabled}
        style={{
          width: '100%', padding: 9, fontSize: 13, fontWeight: 500,
          marginTop: 8,
          background: (!text.trim() || loading || disabled) ? 'var(--border-subtle)' : 'var(--accent)',
          color: (!text.trim() || loading || disabled) ? 'var(--text-muted)' : '#fff',
          borderRadius: 'var(--radius-sm)',
          transition: 'background 0.12s'
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Spinner /> Оцінюю…
          </span>
        ) : 'Оцінити'}
      </button>
      {error && (
        <div style={{
          marginTop: 8, padding: '8px 10px', fontSize: 12,
          background: '#FEF2F2', color: '#991B1B', borderRadius: 'var(--radius-sm)',
          border: '1px solid #FECACA', lineHeight: 1.4
        }}>
          <div style={{ marginBottom: 4 }}>{error}</div>
          <button
            onClick={handleSubmit}
            style={{
              fontSize: 11, fontWeight: 500, color: 'var(--accent)',
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
    <svg width="14" height="14" viewBox="0 0 16 16" style={{
      animation: 'spin 0.7s linear infinite'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
