import { useState, useEffect, useCallback } from 'react'
import FoodInput from './components/FoodInput'
import StagingList from './components/StagingList'
import DailyProgress from './components/DailyProgress'
import EntryLog from './components/EntryLog'
import Settings from './components/Settings'
import DateNav from './components/DateNav'
import ApiKeyPrompt from './components/ApiKeyPrompt'
import TabBar from './components/TabBar'
import CalendarView from './components/CalendarView'

const DEFAULT_TARGETS = { kcal: 1650, protein: 115, fat: 57, carbs: 160 }

const TABS = [
  { id: 'today', label: 'Сьогодні' },
  { id: 'calendar', label: 'Календар' },
]

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

function saveEntries(date, entries) {
  localStorage.setItem(`entries:${date}`, JSON.stringify(entries))
}

function loadTargets() {
  try {
    return { ...DEFAULT_TARGETS, ...JSON.parse(localStorage.getItem('targets')) }
  } catch { return { ...DEFAULT_TARGETS } }
}

function saveTargets(t) {
  localStorage.setItem('targets', JSON.stringify(t))
}

function loadApiKey() {
  return localStorage.getItem('anthropic_api_key') || ''
}

function saveApiKey(key) {
  localStorage.setItem('anthropic_api_key', key)
}

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState([])
  const [targets, setTargets] = useState(loadTargets)
  const [stagedItems, setStagedItems] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(loadApiKey)

  const dk = dateKey(currentDate)
  const isToday = dk === dateKey(new Date())

  useEffect(() => {
    setEntries(loadEntries(dk))
  }, [dk])

  const updateEntries = useCallback((newEntries) => {
    setEntries(newEntries)
    saveEntries(dk, newEntries)
  }, [dk])

  const handleEstimated = (items) => {
    setStagedItems(items)
  }

  const handleConfirmStaged = () => {
    const now = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    const newItems = stagedItems.map(item => ({ ...item, time: now, id: crypto.randomUUID() }))
    updateEntries([...entries, ...newItems])
    setStagedItems(null)
  }

  const handleDeleteEntry = (id) => {
    updateEntries(entries.filter(e => e.id !== id))
  }

  const handleUpdateTargets = (newTargets) => {
    setTargets(newTargets)
    saveTargets(newTargets)
  }

  const handleApiKeySave = (key) => {
    setApiKey(key)
    saveApiKey(key)
  }

  const goDay = (offset) => {
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + offset)
      return d
    })
  }

  const handleCalendarDateSelect = (date) => {
    setCurrentDate(date)
    setActiveTab('today')
  }

  if (!apiKey) {
    return <ApiKeyPrompt onSave={handleApiKeySave} />
  }

  return (
    <div>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 0, padding: '4px 0'
      }}>
        <span style={{
          fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em',
          color: 'var(--text-primary)'
        }}>
          Тарілка дня
        </span>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            width: 26, height: 26,
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', transition: 'color 0.12s',
            background: showSettings ? 'var(--bg-card)' : 'transparent'
          }}
        >
          {showSettings ? <CloseIcon /> : <SettingsIcon />}
        </button>
      </header>

      {showSettings && (
        <Settings
          targets={targets}
          onUpdate={handleUpdateTargets}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeySave}
        />
      )}

      {activeTab === 'today' && (
        <div className="app-columns">
          <div className="app-col-left">
            <DateNav
              date={currentDate}
              isToday={isToday}
              onPrev={() => goDay(-1)}
              onNext={() => goDay(1)}
              onToday={() => setCurrentDate(new Date())}
            />
            <DailyProgress entries={entries} targets={targets} />
          </div>

          <div className="app-col-right">
            <FoodInput apiKey={apiKey} onEstimated={handleEstimated} disabled={!!stagedItems} />

            {stagedItems && (
              <StagingList
                items={stagedItems}
                onChange={setStagedItems}
                onConfirm={handleConfirmStaged}
                onCancel={() => setStagedItems(null)}
              />
            )}

            <EntryLog entries={entries} onDelete={handleDeleteEntry} />
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <CalendarView
          targets={targets}
          onSelectDate={handleCalendarDateSelect}
        />
      )}

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
