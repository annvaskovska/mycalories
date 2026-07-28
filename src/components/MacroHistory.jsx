import { useMemo, useState } from 'react'

const MACRO_OPTIONS = [
  { key: 'kcal', label: 'Калорії', unit: 'ккал', decimals: 0 },
  { key: 'protein', label: 'Білки', unit: 'г', decimals: 1 },
  { key: 'fat', label: 'Жири', unit: 'г', decimals: 1 },
  { key: 'carbs', label: 'Вуглеводи', unit: 'г', decimals: 1 },
]

const MONTH_ABBR = [
  'січ', 'лют', 'бер', 'кві', 'тра', 'чер',
  'лип', 'сер', 'вер', 'жов', 'лис', 'гру',
]

const ACCENT = '#5E6AD2'
const ACCENT_DEEP = '#454FB5'

const VB_W = 320
const VB_H = 120

function dateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function loadEntries(date) {
  try {
    return JSON.parse(localStorage.getItem(`entries:${date}`)) || []
  } catch { return [] }
}

function sumField(entries, field) {
  return entries.reduce((s, e) => s + (e[field] || 0), 0)
}

function niceCeil(x) {
  if (x <= 0) return 1
  const exp = Math.floor(Math.log10(x))
  const base = Math.pow(10, exp)
  const f = x / base
  const tiers = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]
  const nf = tiers.find(t => f <= t) || 10
  return nf * base
}

function pluralDays(n) {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return 'днів'
  const mod10 = n % 10
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дні'
  return 'днів'
}

function fmtValue(v, macro) {
  if (macro.decimals === 0) return String(Math.round(v))
  return String(Math.round(v * 10) / 10)
}

function fmtAxis(v, macro) {
  if (macro.key === 'kcal') return String(Math.round(v))
  return String(Math.round(v * 10) / 10)
}

// Fritsch–Carlson monotone cubic — a smooth line that never overshoots.
function monotonePath(pts) {
  const n = pts.length
  if (n < 2) return ''
  const xs = pts.map(p => p.x)
  const ys = pts.map(p => p.y)
  const dx = [], slope = []
  for (let i = 0; i < n - 1; i++) {
    const h = xs[i + 1] - xs[i]
    dx.push(h)
    slope.push((ys[i + 1] - ys[i]) / h)
  }
  const m = new Array(n)
  m[0] = slope[0]
  m[n - 1] = slope[n - 2]
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) m[i] = 0
    else m[i] = (slope[i - 1] + slope[i]) / 2
  }
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) { m[i] = 0; m[i + 1] = 0; continue }
    const a = m[i] / slope[i]
    const b = m[i + 1] / slope[i]
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[i] = t * a * slope[i]
      m[i + 1] = t * b * slope[i]
    }
  }
  let d = `M ${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i]
    const c1x = xs[i] + h / 3
    const c1y = ys[i] + (m[i] * h) / 3
    const c2x = xs[i + 1] - h / 3
    const c2y = ys[i + 1] - (m[i + 1] * h) / 3
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${xs[i + 1].toFixed(2)} ${ys[i + 1].toFixed(2)}`
  }
  return d
}

export default function MacroHistory({ year, month, targets, selectedDay, onSelectDay }) {
  const [macroKey, setMacroKey] = useState('kcal')
  const [hoverDay, setHoverDay] = useState(null)

  const macro = MACRO_OPTIONS.find(m => m.key === macroKey) || MACRO_OPTIONS[0]
  const target = targets[macro.key] || 0

  const days = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const arr = []
    for (let d = 1; d <= daysInMonth; d++) {
      const entries = loadEntries(dateKey(new Date(year, month, d)))
      if (entries.length === 0) {
        arr.push({ day: d, hasData: false })
        continue
      }
      arr.push({
        day: d,
        hasData: true,
        kcal: sumField(entries, 'kcal'),
        protein: sumField(entries, 'protein'),
        fat: sumField(entries, 'fat'),
        carbs: sumField(entries, 'carbs'),
      })
    }
    return arr
  }, [year, month])

  const daysInMonth = days.length
  const loggedDays = days.filter(d => d.hasData)
  const hasAny = loggedDays.length > 0

  const summary = useMemo(() => {
    if (!hasAny) return null
    const totalVal = loggedDays.reduce((s, d) => s + d[macro.key], 0)
    const avg = totalVal / loggedDays.length
    return { avg, count: loggedDays.length }
  }, [loggedDays, macro.key, hasAny])

  // Chart geometry
  const chart = useMemo(() => {
    if (!hasAny) return null
    const values = loggedDays.map(d => d[macro.key])
    const rawMax = Math.max(target, ...values) * 1.06
    const step = niceCeil(rawMax / 3)
    const yMax = step * 3 || 1

    const M = { top: 10, right: 10, bottom: 18, left: macro.key === 'kcal' ? 22 : 18 }
    const plotW = VB_W - M.left - M.right
    const plotH = VB_H - M.top - M.bottom
    const baselineY = M.top + plotH

    const x = day => M.left + (daysInMonth <= 1 ? 0 : ((day - 1) / (daysInMonth - 1)) * plotW)
    const y = v => M.top + plotH - (v / yMax) * plotH

    // Split into contiguous runs of logged days (gaps break the line).
    const segments = []
    let cur = []
    for (const d of days) {
      if (d.hasData) {
        cur.push({ x: x(d.day), y: y(d[macro.key]), day: d.day, value: d[macro.key] })
      } else if (cur.length) {
        segments.push(cur)
        cur = []
      }
    }
    if (cur.length) segments.push(cur)

    const gridVals = [0, step, step * 2, step * 3]
    const xTicks = [1, 5, 10, 15, 20, 25, 30].filter(d => d <= daysInMonth)

    return { M, plotW, plotH, baselineY, x, y, yMax, step, segments, gridVals, xTicks }
  }, [days, daysInMonth, loggedDays, macro.key, target, hasAny])

  const handlePointer = (e) => {
    if (!chart) return
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * VB_W
    const frac = (svgX - chart.M.left) / chart.plotW
    const clamped = Math.max(0, Math.min(1, frac))
    const day = daysInMonth <= 1 ? 1 : Math.round(clamped * (daysInMonth - 1)) + 1
    setHoverDay(day)
  }

  const handleSelect = (e) => {
    if (!chart) return
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * VB_W
    const frac = (svgX - chart.M.left) / chart.plotW
    const clamped = Math.max(0, Math.min(1, frac))
    const day = daysInMonth <= 1 ? 1 : Math.round(clamped * (daysInMonth - 1)) + 1
    const rec = days[day - 1]
    if (rec && rec.hasData) onSelectDay(day)
  }

  const activeDay = hoverDay != null ? days[hoverDay - 1] : null

  const tableRows = useMemo(
    () => loggedDays.slice().sort((a, b) => b.day - a.day),
    [loggedDays]
  )

  const ariaLabel = hasAny
    ? `Графік: ${macro.label} за днями місяця. Норма ${fmtAxis(target, macro)} ${macro.unit}. ${summary ? `Середнє ${fmtValue(summary.avg, macro)} ${macro.unit} за ${summary.count} ${pluralDays(summary.count)}.` : ''}`
    : `Графік: ${macro.label}. Немає даних за цей місяць.`

  return (
    <div style={{ marginTop: 20 }}>
      {/* Macro filter — real radio group */}
      <div
        className="mh-filter"
        role="radiogroup"
        aria-label="Показник для графіка"
      >
        {MACRO_OPTIONS.map(m => {
          const active = m.key === macroKey
          return (
            <button
              key={m.key}
              role="radio"
              aria-checked={active}
              onClick={() => setMacroKey(m.key)}
              style={{
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: active ? 500 : 400,
                borderRadius: 999,
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'rgba(94,106,210,0.08)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'background 0.12s, border-color 0.12s, color 0.12s',
              }}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      {!hasAny ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 16px',
          color: 'var(--text-muted)',
          fontSize: 12.5,
          marginTop: 16,
        }}>
          Ще немає даних за цей місяць
        </div>
      ) : (
        <>
          {/* Summary row */}
          {summary && (
            <div style={{
              marginTop: 12,
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              Середнє: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {fmtValue(summary.avg, macro)} {macro.unit}
              </span>
              {' · '}
              {summary.count} {pluralDays(summary.count)} з записами
            </div>
          )}

          {/* Chart */}
          <div style={{ position: 'relative', marginTop: 10 }}>
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              width="100%"
              role="img"
              aria-label={ariaLabel}
              style={{ display: 'block', touchAction: 'none', cursor: 'pointer' }}
              onPointerMove={handlePointer}
              onPointerDown={(e) => { handlePointer(e); handleSelect(e) }}
              onPointerLeave={() => setHoverDay(null)}
            >
              <defs>
                <linearGradient id="mh-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal gridlines + y labels */}
              {chart.gridVals.map((v, i) => (
                <line
                  key={i}
                  x1={chart.M.left} y1={chart.y(v)}
                  x2={VB_W - chart.M.right} y2={chart.y(v)}
                  stroke="var(--border-subtle)" strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {/* Target reference line */}
              <line
                x1={chart.M.left} y1={chart.y(target)}
                x2={VB_W - chart.M.right} y2={chart.y(target)}
                stroke={ACCENT} strokeWidth="1"
                strokeDasharray="4 3" opacity="0.5"
                vectorEffect="non-scaling-stroke"
              />

              {/* Area fills + lines per contiguous segment */}
              {chart.segments.map((seg, i) => {
                if (seg.length < 2) return null
                const line = monotonePath(seg)
                const area = `${line} L ${seg[seg.length - 1].x.toFixed(2)} ${chart.baselineY.toFixed(2)} L ${seg[0].x.toFixed(2)} ${chart.baselineY.toFixed(2)} Z`
                return (
                  <g key={i}>
                    <path d={area} fill="url(#mh-grad)" />
                    <path d={line} fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                )
              })}

              {/* Vertical guide at hovered day */}
              {activeDay && (
                <line
                  x1={chart.x(activeDay.day)} y1={chart.M.top}
                  x2={chart.x(activeDay.day)} y2={chart.baselineY}
                  stroke="var(--text-muted)" strokeWidth="1"
                  strokeDasharray="2 2" opacity="0.6"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Data points */}
              {loggedDays.map(d => {
                const over = d[macro.key] > target
                const isActive = (hoverDay === d.day) || (selectedDay === d.day)
                return (
                  <circle
                    key={d.day}
                    cx={chart.x(d.day)} cy={chart.y(d[macro.key])}
                    r={isActive ? 4 : 3}
                    fill={over ? ACCENT_DEEP : ACCENT}
                    stroke="var(--bg-page)" strokeWidth="1"
                  />
                )
              })}
            </svg>

            {/* Axis labels — fixed-pixel HTML overlays so text stays a
                consistent size regardless of how wide the chart scales. */}
            {chart.gridVals.map((v, i) => (
              <div
                key={`y-${i}`}
                style={{
                  position: 'absolute',
                  top: `${(chart.y(v) / VB_H) * 100}%`,
                  left: `${((chart.M.left - 4) / VB_W) * 100}%`,
                  transform: 'translate(-100%, -50%)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {fmtAxis(v, macro)}
              </div>
            ))}

            <div style={{
              position: 'absolute',
              top: `${(chart.y(target) / VB_H) * 100}%`,
              left: `${((VB_W - chart.M.right) / VB_W) * 100}%`,
              transform: 'translate(-100%, -118%)',
              fontSize: 10,
              color: ACCENT,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}>
              Норма {fmtAxis(target, macro)} {macro.unit}
            </div>

            {chart.xTicks.map(d => (
              <div
                key={`x-${d}`}
                style={{
                  position: 'absolute',
                  top: `${((chart.baselineY + 4) / VB_H) * 100}%`,
                  left: `${(chart.x(d) / VB_W) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                  pointerEvents: 'none',
                }}
              >
                {d}
              </div>
            ))}

            {/* Tooltip */}
            {activeDay && (
              <div style={{
                position: 'absolute',
                top: 2,
                left: `${Math.max(14, Math.min(86, (chart.x(activeDay.day) / VB_W) * 100))}%`,
                transform: 'translateX(-50%)',
                background: 'var(--bg-page)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 8px',
                fontSize: 10.5,
                lineHeight: 1.35,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums',
                zIndex: 2,
              }}>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {activeDay.day} {MONTH_ABBR[month]}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {activeDay.hasData
                    ? `${fmtValue(activeDay[macro.key], macro)} ${macro.unit}`
                    : 'Немає запису'}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Норма {fmtAxis(target, macro)} {macro.unit}
                </div>
              </div>
            )}
          </div>

          {/* Per-day table */}
          <div className="mh-table-wrap">
            <table className="mh-table">
              <thead>
                <tr>
                  <th scope="col" style={thStyle('left')}>Дата</th>
                  {MACRO_OPTIONS.map(m => {
                    const sel = m.key === macro.key
                    return (
                      <th
                        key={m.key}
                        scope="col"
                        className={sel ? undefined : 'mh-hide-narrow'}
                        style={{ ...thStyle('right'), ...(sel ? selHeadStyle : null) }}
                      >
                        {m.label}
                      </th>
                    )
                  })}
                  <th scope="col" style={thStyle('right')}>% від норми</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(d => {
                  const pct = target > 0 ? Math.round((d[macro.key] / target) * 100) : 0
                  const isSel = selectedDay === d.day
                  return (
                    <tr
                      key={d.day}
                      onClick={() => onSelectDay(d.day)}
                      style={{
                        cursor: 'pointer',
                        background: isSel ? 'rgba(94,106,210,0.05)' : 'transparent',
                      }}
                    >
                      <td style={tdStyle('left')}>{d.day} {MONTH_ABBR[month]}</td>
                      {MACRO_OPTIONS.map(m => {
                        const sel = m.key === macro.key
                        return (
                          <td
                            key={m.key}
                            className={sel ? undefined : 'mh-hide-narrow'}
                            style={{ ...tdStyle('right'), ...(sel ? selColStyle : null) }}
                          >
                            {fmtValue(d[m.key], m)}
                          </td>
                        )
                      })}
                      <td style={tdStyle('right')}>{pct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function thStyle(align) {
  return {
    position: 'sticky',
    top: 0,
    background: 'var(--bg-page)',
    textAlign: align,
    fontSize: 10.5,
    fontWeight: 500,
    color: 'var(--text-muted)',
    padding: '6px 8px',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  }
}

function tdStyle(align) {
  return {
    textAlign: align,
    fontSize: 12,
    color: 'var(--text-primary)',
    padding: '7px 8px',
    borderBottom: '1px solid var(--border-subtle)',
    fontVariantNumeric: align === 'right' ? 'tabular-nums' : 'normal',
    whiteSpace: 'nowrap',
  }
}

const selColStyle = { background: 'rgba(94,106,210,0.06)' }
const selHeadStyle = { background: '#F5F6FC' }
