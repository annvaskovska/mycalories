import { useState, useEffect, useCallback } from 'react'
import FoodInput from './components/FoodInput'
import StagingList from './components/StagingList'
import DailyProgress from './components/DailyProgress'
import EntryLog from './components/EntryLog'
import Settings from './components/Settings'
import DateNav from './components/DateNav'
import ApiKeyPrompt from './components/ApiKeyPrompt'

const DEFAULT_TARGETS = { kcal: 1650, protein: 115, fat: 57, carbs: 160 }

function dateKey(d) {
  return d.toISOString().slice(0, 10)
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

export default function App() {
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

  if (!apiKey) {
    return <ApiKeyPrompt onSave={handleApiKeySave} />
  }

  return (
    <div>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid var(--border-light)`
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700,
          color: 'var(--text)', letterSpacing: '-0.02em'
        }}>
          Тарілка дня
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            padding: '6px 14px', fontSize: '0.85rem', fontWeight: 500,
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            background: showSettings ? 'var(--text)' : 'transparent',
            color: showSettings ? 'var(--bg-card)' : 'var(--text-muted)',
            transition: 'all 0.15s'
          }}
        >
          {showSettings ? '✕' : '⚙'}
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

      <DateNav
        date={currentDate}
        isToday={isToday}
        onPrev={() => goDay(-1)}
        onNext={() => goDay(1)}
        onToday={() => setCurrentDate(new Date())}
      />

      <DailyProgress entries={entries} targets={targets} />

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
  )
}
