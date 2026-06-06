/* ============================================================
   Index Aligner — Connect / History / Settings pages
   ============================================================ */
import React, { useState } from 'react'
import { Icon, Switch } from './ui.jsx'
import { fmtUsd } from './data.js'

export function Connect({ onConnect }) {
  const [pending, setPending] = useState(null)
  function pick(kind) {
    setPending(kind)
    setTimeout(() => onConnect(kind), 850)
  }
  return (
    <div className="connect-wrap">
      <div className="connect-card">
        <div className="connect-icon"><Icon name="wallet" sw={1.8} /></div>
        <h2>Connect your wallet</h2>
        <p>Index Aligner reads your SSI index holdings to check them against target. It can't move funds without your signature.</p>
        <div className="connect-actions">
          <button className="wallet-opt" onClick={() => pick('metamask')} disabled={!!pending}>
            <span className="wo-ic" style={{ background: '#f6851b22' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f6851b"><path d="M21 4l-7.2 5.3 1.3-3.1L21 4zM3 4l7.1 5.4-1.2-3.2L3 4zm15.3 12.1-1.9 2.9 4.1 1.1 1.2-3.9-3.4-.1zM2.3 16.2 3.5 20l4.1-1.1-1.9-2.9-3.4.2zM7.4 10.6 6.2 12.4l4.1.2-.1-4.4-2.8 2.4zm9.2 0-2.9-2.5-.1 4.5 4.1-.2-1.1-1.8zM7.6 19l2.5-1.2-2.1-1.7-.4 2.9zm6.3-1.2L16.4 19l-.4-2.9-2.1 1.7z"/></svg>
            </span>
            <div>
              <div className="wo-name">{pending === 'metamask' ? 'Connecting…' : 'MetaMask'}</div>
              <div className="wo-sub">Browser extension wallet</div>
            </div>
            <span className="wo-arrow"><Icon name="arrow" sw={2.2} /></span>
          </button>
          <button className="wallet-opt" onClick={() => pick('demo')} disabled={!!pending}>
            <span className="wo-ic" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><Icon name="bolt" sw={2} /></span>
            <div>
              <div className="wo-name">{pending === 'demo' ? 'Loading…' : 'Use a demo wallet'}</div>
              <div className="wo-sub">Pre-loaded with a drifted SSI Top 10 position</div>
            </div>
            <span className="wo-arrow"><Icon name="arrow" sw={2.2} /></span>
          </button>
        </div>
        <div className="connect-secure"><Icon name="shield" sw={2} /> Read-only access · we never hold your keys</div>
      </div>
    </div>
  )
}

export function History({ history }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>History</h1>
          <p>Every rebalance you've run, with the volume traded and drift corrected.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Past rebalances</h3>
          <span className="sub">{history.length} total</span>
        </div>
        <div className="history-list">
          {history.map(h => (
            <div className="hist-row" key={h.id}>
              <span className="hist-ic"><Icon name="scale" sw={1.8} /></span>
              <div className="hist-main">
                <div className="hm-title">{h.index}</div>
                <div className="hm-date">{h.date}</div>
              </div>
              <div className="hist-meta"><div className="hm-k">Trades</div><div className="hm-v">{h.trades}</div></div>
              <div className="hist-meta"><div className="hm-k">Volume</div><div className="hm-v">{fmtUsd(h.volume, 2)}</div></div>
              <div className="hist-meta">
                <div className="hm-k">Drift fixed</div>
                <div className="hm-v" style={{ color: 'var(--pos)' }}>−{h.drift}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function Settings({ settings, onChange, theme, onToggleTheme }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Tune how Index Aligner watches your portfolio.</p>
        </div>
      </div>
      <div className="card settings-grid">
        <div className="set-row">
          <div className="set-info">
            <h4>Drift tolerance</h4>
            <p>How far an asset can stray from its target before we flag it for rebalancing.</p>
          </div>
          <div className="set-control">
            <div className="range-row">
              <input type="range" min="1" max="15" step="1" value={settings.tolerance}
                     onChange={e => onChange({ tolerance: +e.target.value })} />
              <span className="rv">±{settings.tolerance}%</span>
            </div>
          </div>
        </div>

        <div className="set-row">
          <div className="set-info">
            <h4>Dark mode</h4>
            <p>Easier on the eyes for late-night portfolio checks.</p>
          </div>
          <div className="set-control"><Switch on={theme === 'dark'} onClick={onToggleTheme} /></div>
        </div>

        <div className="set-row">
          <div className="set-info">
            <h4>Email alerts <span className="set-pill-coming">Coming soon</span></h4>
            <p>Get notified the moment a rebalance is worth doing, instead of checking manually.</p>
          </div>
          <div className="set-control"><Switch on={settings.alerts} onClick={() => onChange({ alerts: !settings.alerts })} /></div>
        </div>

        {settings.alerts && (
          <div className="set-row">
            <div className="set-info">
              <h4>Alert email</h4>
              <p>Where we'll send rebalance notifications.</p>
            </div>
            <div className="set-control">
              <input className="text-input" type="email" placeholder="you@wallet.eth"
                     value={settings.email} onChange={e => onChange({ email: e.target.value })} />
            </div>
          </div>
        )}

        <div className="set-row">
          <div className="set-info">
            <h4>One-click execution <span className="set-pill-coming">Coming soon</span></h4>
            <p>Route the entire rebalance through SoDEX automatically when you confirm.</p>
          </div>
          <div className="set-control"><Switch on={settings.autoExec} onClick={() => onChange({ autoExec: !settings.autoExec })} /></div>
        </div>
      </div>
    </>
  )
}
