import { useState, useMemo, useEffect } from 'react'
import MacroHistory from './MacroHistory'

const MONTH_NAMES = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
]

const WEEKDAY_HEADERS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

const OVER_TARGET_THRESHOLD = 1.15

const STATUS_STYLES = {
  'on-target': { bg: '#f0fdf4', border: '#bbf7d0' },
  'logged':    { bg: '#fefce8', border: '#fef08a' },
}

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

function sumKcal(entries) {
  return entries.reduce((s, e) => s + (e.kcal || 0), 0)
}

function getMonthDays(year, month) {
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  let startWeekday = new Date(year, month, 1).getDay()
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return cells
}

function getDayStatus(year, month, day, target) {
  const dk = dateKey(new Date(year, month, day))
  const entries = loadEntries(dk)
  if (entries.length === 0) return 'empty'
  const total = sumKcal(entries)
  return total <= target * OVER_TARGET_THRESHOLD ? 'on-target' : 'logged'
}

function computeStreak(today, target) {
  let count = 0
  const d = new Date(today)
  if (loadEntries(dateKey(d)).length === 0) {
    d.setDate(d.getDate() - 1)
  }

  while (true) {
    const entries = loadEntries(dateKey(d))
    if (entries.length === 0) break
    if (sumKcal(entries) > target * OVER_TARGET_THRESHOLD) break
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  )
}

export default function CalendarView({ targets, onSelectDate }) {
  const target = targets.kcal
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => { setSelectedDay(null) }, [viewYear, viewMonth])

  const cells = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth])

  const statuses = useMemo(() => {
    const map = {}
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = getDayStatus(viewYear, viewMonth, d, target)
    }
    return map
  }, [viewYear, viewMonth, target])

  const streak = useMemo(() => computeStreak(new Date(), target), [target])

  const todayKey = dateKey(new Date())

  const goMonth = (offset) => {
    const d = new Date(viewYear, viewMonth + offset, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const handleDayClick = (day) => {
    if (!day) return
    onSelectDate(new Date(viewYear, viewMonth, day))
  }

  const monthStats = useMemo(() => {
    let onTarget = 0
    let logged = 0
    for (const s of Object.values(statuses)) {
      if (s === 'on-target') onTarget++
      else if (s === 'logged') logged++
    }
    return { onTarget, logged }
  }, [statuses])

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 8,
      }}>
        <button onClick={() => goMonth(-1)} style={navBtnStyle}><ChevronLeft /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </div>
          {streak >= 1 ? (
            <div style={{
              fontSize: 10.5, fontWeight: 500, color: 'var(--success)',
              marginTop: 1,
            }}>
              &#x1F525; {streak} {streak < 5 ? 'дні' : 'днів'} поспіль в нормі
            </div>
          ) : (
            <div style={{
              fontSize: 10.5, color: 'var(--text-muted)',
              marginTop: 1,
            }}>
              Почни серію сьогодні!
            </div>
          )}
        </div>
        <button onClick={() => goMonth(1)} style={navBtnStyle}><ChevronRight /></button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
      }}>
        {WEEKDAY_HEADERS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 500,
            color: 'var(--text-muted)', padding: '0 0 4px',
          }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2,
      }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const status = statuses[day]
          const dk = dateKey(new Date(viewYear, viewMonth, day))
          const isToday = dk === todayKey
          const isFuture = dk > todayKey
          const isSelected = day === selectedDay

          const style = STATUS_STYLES[status]
          const bg = style ? style.bg : 'transparent'
          const borderColor = isSelected || isToday
            ? 'var(--accent)'
            : style ? style.border : 'transparent'

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isFuture}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '6px 0',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12, fontWeight: isToday || isSelected ? 600 : 400,
                fontVariantNumeric: 'tabular-nums',
                background: bg,
                color: isFuture ? 'var(--text-muted)' : 'var(--text-primary)',
                border: `1px solid ${borderColor}`,
                boxShadow: isSelected ? '0 0 0 2px rgba(94,106,210,0.30)' : 'none',
                cursor: isFuture ? 'default' : 'pointer',
                transition: 'background 0.12s, box-shadow 0.12s',
                opacity: isFuture ? 0.45 : 1,
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div style={{
        display: 'flex', gap: 12, justifyContent: 'center',
        marginTop: 10, fontSize: 10.5, color: 'var(--text-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 2,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
          }} />
          В нормі ({monthStats.onTarget})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 2,
            background: '#fefce8', border: '1px solid #fef08a',
          }} />
          Активний день ({monthStats.logged})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 2,
            background: 'var(--bg-page)', border: '1px solid var(--border)',
          }} />
          Немає
        </div>
      </div>

      <MacroHistory
        year={viewYear}
        month={viewMonth}
        targets={targets}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
    </div>
  )
}

const navBtnStyle = {
  width: 22, height: 22,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-secondary)', background: 'transparent',
}
