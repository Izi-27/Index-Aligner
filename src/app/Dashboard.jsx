/* ============================================================
   Index Aligner — Dashboard view
   ============================================================ */
import React, { useState, useEffect, useRef } from 'react'
import { Icon, Coin, WeightBar, DevChip, useCountUp } from './ui.jsx'
import { fmtUsd, fmtPrice, summary as computeSummary } from './data.js'

function IndexSelect({ indexes, activeId, onSelect, tolerance }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  const active = indexes.find(i => i.id === activeId)
  return (
    <div className="index-select" ref={ref}>
      <button className={"index-trigger" + (open ? " open" : "")} onClick={() => setOpen(o => !o)}>
        <Icon name="layers" sw={2} />
        <span>{active.name}</span>
        <span className="chev"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"></path></svg></span>
      </button>
      {open && (
        <div className="index-menu">
          {indexes.map(ix => {
            const s = computeSummary(ix, tolerance)
            return (
              <div key={ix.id} className={"index-opt" + (ix.id === activeId ? " active" : "")}
                   onClick={() => { onSelect(ix.id); setOpen(false) }}>
                <Icon name="layers" sw={1.8} />
                <div>
                  <div className="io-name">{ix.name}</div>
                  <div className="io-meta">{ix.assets.length} assets · {fmtUsd(ix.value, 0)}</div>
                </div>
                <div className="io-right">
                  <span className={"pill " + (s.balanced ? "pill-pos" : "pill-warn")} style={{ padding: '4px 9px', fontSize: 11 }}>
                    {s.balanced ? "Balanced" : s.offCount + " off"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryStrip({ index, summary }) {
  const value = useCountUp(index.value, [index.id, index.value])
  const dayChange = index.assets.reduce((s, a) => s + (a.change * a.current / 100), 0)
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="summary-row">
        <div className="stat">
          <div className="lab">Portfolio value</div>
          <div className="val">{fmtUsd(value, 2)}</div>
          <div className={"chg " + (dayChange >= 0 ? "pos" : "neg")}>{dayChange >= 0 ? "▲" : "▼"} {Math.abs(dayChange).toFixed(2)}% (24h)</div>
        </div>
        <div className="stat">
          <div className="lab">Assets off target</div>
          <div className="val">{summary.offCount}<span style={{ fontSize: 15, color: 'var(--text-faint)' }}> / {index.assets.length}</span></div>
          <div className="chg" style={{ color: 'var(--text-faint)' }}>{summary.balanced ? "All aligned" : "Needs attention"}</div>
        </div>
        <div className="stat">
          <div className="lab">Largest drift</div>
          <div className="val sm">{summary.maxDev}%</div>
          <div className="chg" style={{ color: 'var(--text-faint)' }}>from target weight</div>
        </div>
        <div className="stat">
          <div className="lab">To rebalance</div>
          <div className="val sm">{fmtUsd(summary.volume, 0)}</div>
          <div className="chg" style={{ color: 'var(--text-faint)' }}>total trade volume</div>
        </div>
      </div>
    </div>
  )
}

function HoldingsTable({ rows }) {
  const scale = Math.max.apply(null, rows.map(r => Math.max(r.current, r.target))) * 1.12
  return (
    <div className="card">
      <div className="card-head">
        <h3>Holdings</h3>
        <span className="sub mono">current vs <b style={{ color: 'var(--text-mut)' }}>● target</b> weight</span>
      </div>
      <div className="holdings">
        <div className="hold-row head">
          <span>Asset</span>
          <span className="hp-h">Price · 24h</span>
          <span>Current weight</span>
          <span className="hp-t">Target</span>
          <span style={{ textAlign: 'right' }}>Deviation</span>
        </div>
        {rows.map(r => (
          <div className="hold-row" key={r.sym}>
            <div className="hold-asset">
              <Coin a={r} />
              <div>
                <div className="nm">{r.name}</div>
                <div className="tk">{r.sym}</div>
              </div>
            </div>
            <div className="hold-price">
              {fmtPrice(r.price)}
              <span className={"c " + (r.change >= 0 ? "chg pos" : "chg neg")} style={{ color: r.change >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change).toFixed(1)}%
              </span>
            </div>
            <div className="hold-weight"><WeightBar row={r} scale={scale} /></div>
            <div className="hold-target">{r.target}%</div>
            <div style={{ textAlign: 'right' }}><DevChip row={r} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HealthRing({ score, balanced }) {
  const R = 56, C = 2 * Math.PI * R
  const animated = useCountUp(score, [score])
  const off = C * (1 - animated / 100)
  const color = balanced ? 'var(--pos)' : animated >= 70 ? 'var(--warn)' : 'var(--neg)'
  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={R} fill="none" stroke="var(--bg-tint)" strokeWidth="11" />
        <circle cx="66" cy="66" r={R} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={off} style={{ transition: 'stroke .4s' }} />
      </svg>
      <div className="ring-num">
        <b>{Math.round(animated)}</b>
        <span>health</span>
      </div>
    </div>
  )
}

function RebalancePanel({ summary, orders, onRebalance }) {
  return (
    <div className="rebal-panel">
      <div className="card">
        <div className="health-ring">
          <HealthRing score={summary.score} balanced={summary.balanced} />
          <div className="health-status" style={{ color: summary.balanced ? 'var(--pos)' : 'var(--text)' }}>
            {summary.balanced ? "On target" : "Rebalance recommended"}
          </div>
          <div className="health-sub">
            {summary.balanced
              ? "Every asset is within your drift tolerance. Nothing to do."
              : summary.offCount + " asset" + (summary.offCount > 1 ? "s have" : " has") + " drifted beyond your tolerance."}
          </div>
        </div>

        {summary.balanced ? (
          <div className="balanced-note">
            <Icon name="check" sw={2.4} />
            Portfolio is balanced
          </div>
        ) : (
          <>
            <div className="rebal-stats">
              <div className="rebal-stat"><span className="k">Orders to place</span><span className="v">{orders.length}</span></div>
              <div className="rebal-stat"><span className="k">Trade volume</span><span className="v">{fmtUsd(summary.volume, 2)}</span></div>
              <div className="rebal-stat"><span className="k">Est. fees (0.1%)</span><span className="v">{fmtUsd(summary.volume * 0.001, 2)}</span></div>
            </div>
            <div className="rebal-cta">
              <button className="btn btn-primary btn-block btn-lg" onClick={onRebalance}>
                <Icon name="scale" sw={2} /> Rebalance now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Dashboard(props) {
  const { index, indexes, activeId, onSelect, summary, rows, orders, onRebalance, onRefresh, refreshing, syncedAt, tolerance } = props
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Live view of your index position and how far it has drifted from target.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>synced {syncedAt}</span>
          <button className={"icon-btn" + (refreshing ? " spinning" : "")} onClick={onRefresh} aria-label="Refresh prices"><Icon name="refresh" sw={2} /></button>
          <IndexSelect indexes={indexes} activeId={activeId} onSelect={onSelect} tolerance={tolerance} />
        </div>
      </div>
      <SummaryStrip index={index} summary={summary} />
      <div className="dash-grid">
        <HoldingsTable rows={rows} />
        <RebalancePanel summary={summary} orders={orders} onRebalance={onRebalance} />
      </div>
    </>
  )
}
