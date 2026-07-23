const DAYS = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця", 'субота']
const MONTHS = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
]

function formatDate(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${DAYS[d.getDay()]}`
}

export default function DateNav({ date, isToday, onPrev, onNext, onToday }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 20, gap: 8
    }}>
      <button onClick={onPrev} style={navBtnStyle}>←</button>
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600
        }}>
          {formatDate(date)}
        </div>
        {!isToday && (
          <button
            onClick={onToday}
            style={{
              fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500,
              marginTop: 2, textDecoration: 'underline', textUnderlineOffset: 2
            }}
          >
            сьогодні
          </button>
        )}
        {isToday && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>сьогодні</span>
        )}
      </div>
      <button onClick={onNext} style={navBtnStyle}>→</button>
    </div>
  )
}

const navBtnStyle = {
  width: 40, height: 40, fontSize: '1.1rem',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--bg-card)', color: 'var(--text-muted)'
}
