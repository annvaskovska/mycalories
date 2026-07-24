const TAB_ICONS = {
  today: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  calendar: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
}

export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-page)',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'center',
      zIndex: 900,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{
        display: 'flex', width: '100%', maxWidth: 420,
      }}>
        {tabs.map(tab => {
          const active = tab.id === activeTab
          const icon = TAB_ICONS[tab.id]
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2,
                padding: '8px 0 6px',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.12s',
              }}
            >
              {icon ? icon(active) : null}
              <span style={{
                fontSize: 10, fontWeight: active ? 600 : 500,
                letterSpacing: '0.01em',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
