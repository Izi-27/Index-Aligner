/* ============================================================
   Index Aligner — root App (state + shell + render)
   ============================================================ */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Icon } from './ui.jsx'
import * as D from './data.js'
import { getTheme, toggleTheme as toggleThemeFn } from '../lib/theme.js'
import { LogoMark } from '../components/Logo.jsx'
import Dashboard from './Dashboard.jsx'
import RebalanceDrawer from './RebalanceDrawer.jsx'
import { Connect, History, Settings } from './Pages.jsx'

const STORE_KEY = 'ia-app-v1'

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {} } catch (e) { return {} }
}

function freshIndexes() { return JSON.parse(JSON.stringify(D.INDEXES)) }

function nowStr() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function WalletMenu({ wallet, onDisconnect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="wallet-pill" onClick={() => setOpen(o => !o)}>
        <span className="net"></span>
        <span className="addr">{wallet.addr}</span>
        <span className="avatar"></span>
      </button>
      {open && (
        <div className="index-menu" style={{ right: 0, left: 'auto', minWidth: 220 }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{wallet.label}</div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{wallet.addr}</div>
          </div>
          <div className="index-opt" onClick={onDisconnect} style={{ color: 'var(--neg)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path></svg>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Disconnect</span>
          </div>
        </div>
      )}
    </div>
  )
}

function AppHeader({ theme, wallet, view, setView, onToggleTheme, onDisconnect, connected }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ]
  return (
    <header className="app-header">
      <div className="container app-nav">
        <div className="app-nav-left">
          <a className="brandmark" href="index.html" aria-label="Index Aligner home">
            <LogoMark />
            Index Aligner
          </a>
          {connected && (
            <nav className="app-tabs">
              {tabs.map(t => (
                <button key={t.id} className={"app-tab" + (view === t.id ? " active" : "")} onClick={() => setView(t.id)}>
                  <Icon name={t.icon} sw={2} /> {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>
        <div className="app-nav-right">
          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle dark mode">
            <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>
          </button>
          {connected ? <WalletMenu wallet={wallet} onDisconnect={onDisconnect} /> : <a className="btn btn-ghost" href="index.html">← Back to site</a>}
        </div>
      </div>
    </header>
  )
}

function Toast({ toast }) {
  return (
    <div className={"toast" + (toast ? " show" : "")}>
      {toast && <><Icon name="check" sw="2.6" /> {toast}</>}
    </div>
  )
}

export default function App() {
  const saved = loadState()
  const [theme, setTheme] = useState(getTheme())
  const [wallet, setWallet] = useState(saved.wallet || null)
  const [view, setView] = useState(saved.view || 'dashboard')
  const [activeId, setActiveId] = useState(saved.activeId || 'top10')
  const [indexes, setIndexes] = useState(saved.indexes || freshIndexes())
  const [settings, setSettings] = useState(Object.assign({ tolerance: 5, alerts: false, email: '', autoExec: false }, saved.settings))
  const [history, setHistory] = useState(saved.history || D.SEED_HISTORY)
  const [drawer, setDrawer] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [syncedAt, setSyncedAt] = useState('just now')
  const [toast, setToast] = useState(null)

  // persist
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ wallet, view, activeId, indexes, settings, history }))
  }, [wallet, view, activeId, indexes, settings, history])

  // theme sync
  useEffect(() => {
    function onTheme(e) { setTheme(e.detail) }
    window.addEventListener('ia-theme-change', onTheme)
    return () => window.removeEventListener('ia-theme-change', onTheme)
  }, [])

  const toastTimer = useRef(null)
  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }

  const index = useMemo(() => indexes.find(i => i.id === activeId), [indexes, activeId])
  const rows = useMemo(() => D.rows(index, settings.tolerance), [index, settings.tolerance])
  const orders = useMemo(() => D.orders(index, settings.tolerance), [index, settings.tolerance])
  const summary = useMemo(() => D.summary(index, settings.tolerance), [index, settings.tolerance])

  function connect(kind) {
    const w = kind === 'metamask'
      ? { addr: '0x7a3f…C42b', label: 'MetaMask' }
      : { addr: '0xDem0…A11g', label: 'Demo wallet' }
    setWallet(w)
    setView('dashboard')
    showToast('Wallet connected · holdings loaded')
  }
  function disconnect() {
    setWallet(null)
    setIndexes(freshIndexes())
    setView('dashboard')
    setActiveId('top10')
  }

  function refresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); setSyncedAt(nowStr()); showToast('Prices refreshed') }, 900)
  }

  function completeRebalance(os, sum) {
    // align the active index to target
    setIndexes(prev => prev.map(ix => ix.id === activeId ? D.aligned(ix) : ix))
    // log it
    setHistory(prev => [{
      id: 'h' + Date.now(),
      index: index.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + nowStr(),
      trades: os.length,
      volume: sum.volume,
      drift: sum.maxDev,
      status: 'completed'
    }, ...prev])
    showToast('Rebalance complete · back on target')
  }

  function toggleTheme() { toggleThemeFn() }

  if (!wallet) {
    return (
      <>
        <AppHeader theme={theme} wallet={null} view={view} setView={setView} onToggleTheme={toggleTheme} onDisconnect={disconnect} connected={false} />
        <main className="app-main"><div className="container"><Connect onConnect={connect} /></div></main>
        <Toast toast={toast} />
      </>
    )
  }

  return (
    <>
      <AppHeader theme={theme} wallet={wallet} view={view} setView={setView} onToggleTheme={toggleTheme} onDisconnect={disconnect} connected={true} />
      <main className="app-main">
        <div className="container">
          {view === 'dashboard' && (
            <Dashboard
              index={index} indexes={indexes} activeId={activeId} onSelect={setActiveId}
              summary={summary} rows={rows} orders={orders}
              onRebalance={() => setDrawer(true)} onRefresh={refresh} refreshing={refreshing}
              syncedAt={syncedAt} tolerance={settings.tolerance}
            />
          )}
          {view === 'history' && <History history={history} />}
          {view === 'settings' && <Settings settings={settings} onChange={p => setSettings(s => Object.assign({}, s, p))} theme={theme} onToggleTheme={toggleTheme} />}
        </div>
      </main>
      {drawer && (
        <RebalanceDrawer
          index={index} orders={orders} summary={summary}
          onClose={() => setDrawer(false)}
          onComplete={completeRebalance}
          onViewHistory={() => { setDrawer(false); setView('history') }}
        />
      )}
      <Toast toast={toast} />
    </>
  )
}
