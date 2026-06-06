/* ============================================================
   Index Aligner — UI primitives
   ============================================================ */
import React, { useState, useEffect, useRef } from 'react'

export const ICONS = {
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="2"></rect><rect x="13" y="3" width="8" height="5" rx="2"></rect><rect x="13" y="11" width="8" height="10" rx="2"></rect><rect x="3" y="14" width="8" height="7" rx="2"></rect></>,
  history: <><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></>,
  settings: <><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></>,
  refresh: <><path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 4v5h-5"></path></>,
  check: <path d="M5 12l5 5L20 7"></path>,
  checkSmall: <path d="M4 8l3 3 5-6"></path>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6"></path>,
  close: <path d="M6 6l12 12M18 6L6 18"></path>,
  wallet: <><rect x="2" y="6" width="20" height="13" rx="2.5"></rect><path d="M16 12h3"></path><path d="M2 9h15a2 2 0 0 1 2 2"></path></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
  warn: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><path d="M12 9v4M12 17h.01"></path></>,
  bolt: <path d="M13 2L3 14h7l-1 8 10-12h-7z"></path>,
  scale: <><path d="M12 3v18"></path><path d="M6 7h12"></path><path d="M6 7l-3 6a3 3 0 0 0 6 0z"></path><path d="M18 7l3 6a3 3 0 0 1-6 0z"></path><path d="M8 21h8"></path></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path></>,
  layers: <><path d="M12 2 2 7l10 5 10-5z"></path><path d="m2 12 10 5 10-5M2 17l10 5 10-5"></path></>
}

export function Icon({ name, sw }) {
  return (
    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw || 2}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

export function Coin({ a, size }) {
  const cls = "coin" + (size ? " " + size : "")
  const label = a.sym === 'BTC' ? 'B' : a.sym === 'ETH' ? 'E' : a.sym.slice(0, 1)
  return <span className={cls} style={{ background: a.color }}>{label}</span>
}

export function WeightBar({ row, scale }) {
  const fillPct = Math.min(100, (row.current / scale) * 100)
  const tgtPct = Math.min(100, (row.target / scale) * 100)
  return (
    <div className="weight-bar">
      <span className={"weight-fill " + row.status} style={{ width: fillPct + '%' }}></span>
      <span className="weight-target" style={{ left: tgtPct + '%' }} title={"Target " + row.target + '%'}></span>
      <span className="weight-cur">{row.current}%</span>
    </div>
  )
}

export function DevChip({ row }) {
  if (row.status === 'ok') return <span className="dev-chip ok">on&nbsp;target</span>
  const sign = row.dev > 0 ? '+' : ''
  const arrow = row.dev > 0 ? '▲' : '▼'
  return <span className={"dev-chip " + row.status}>{arrow} {sign}{row.dev}%</span>
}

export function Switch({ on, onClick }) {
  return <button className={"switch" + (on ? " on" : "")} onClick={onClick} role="switch" aria-checked={on}></button>
}

// Animated count-up for the big numbers
export function useCountUp(target, deps) {
  const [val, setVal] = useState(target)
  const prev = useRef(target)
  useEffect(() => {
    const from = prev.current, to = target, dur = 600, t0 = performance.now()
    let raf
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(from + (to - from) * e)
      if (p < 1) raf = requestAnimationFrame(tick)
      else prev.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, deps || [target])
  return val
}
