const DAYS = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця", 'субота']
const MONTHS = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
]

function formatDate(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${DAYS[d.getDay()]}`
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

export default function DateNav({ date, isToday, onPrev, onNext, onToday }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
      marginBottom: 16
    }}>
      <button onClick={onPrev} style={navBtnStyle}><ChevronLeft /></button>
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
          {formatDate(date)}
        </div>
        {!isToday && (
          <button
            onClick={onToday}
            style={{
              fontSize: 10.5, color: 'var(--accent)', fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 1
            }}
          >
            сьогодні
          </button>
        )}
        {isToday && (
          <span style={{
            fontSize: 10.5, color: 'var(--text-muted)',
            letterSpacing: '0.04em', textTransform: 'uppercase'
          }}>
            сьогодні
          </span>
        )}
      </div>
      <button onClick={onNext} style={navBtnStyle}><ChevronRight /></button>
    </div>
  )
}

const navBtnStyle = {
  width: 22, height: 22,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-secondary)', background: 'transparent'
}
