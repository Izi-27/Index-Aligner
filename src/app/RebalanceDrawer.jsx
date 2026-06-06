/* ============================================================
   Index Aligner — Rebalance drawer (review/execute/success)
   ============================================================ */
import React, { useState, useRef } from 'react'
import { Icon, Coin } from './ui.jsx'
import { fmtUsd, fmtPrice, fmtTokens } from './data.js'

function OrderRow({ o }) {
  return (
    <div className="order-row">
      <Coin a={o} />
      <div>
        <div className="oa-name">{o.name} <span style={{ color: 'var(--text-faint)', fontWeight: 600, fontSize: 12 }}>{o.sym}</span></div>
        <div className="oa-amt">{o.side === 'sell' ? '−' : '+'}{fmtTokens(o.tokens)} {o.sym} @ {fmtPrice(o.price)}</div>
      </div>
      <div className={"oa-usd " + o.side}>{o.side === 'sell' ? '−' : '+'}{fmtUsd(o.usd, 2)}</div>
    </div>
  )
}

function ReviewBody({ index, orders, summary }) {
  const sells = orders.filter(o => o.side === 'sell')
  const buys = orders.filter(o => o.side === 'buy')
  const fees = summary.volume * 0.001
  const slippage = summary.volume * 0.0015
  return (
    <>
      <p style={{ color: 'var(--text-mut)', fontSize: 14, marginBottom: 20 }}>
        These trades bring <b style={{ color: 'var(--text)' }}>{index.name}</b> back to its target weights. Review before you confirm.
      </p>

      {sells.length > 0 && <>
        <div className="order-group-label sell">Sell <span className="ln"></span> {sells.length}</div>
        {sells.map(o => <OrderRow key={o.sym} o={o} />)}
      </>}

      {buys.length > 0 && <>
        <div className="order-group-label buy" style={{ marginTop: 18 }}>Buy <span className="ln"></span> {buys.length}</div>
        {buys.map(o => <OrderRow key={o.sym} o={o} />)}
      </>}

      <div className="order-summary">
        <div className="os-row"><span className="k">Trade volume</span><span className="v">{fmtUsd(summary.volume, 2)}</span></div>
        <div className="os-row"><span className="k">Est. network + DEX fees</span><span className="v">{fmtUsd(fees, 2)}</span></div>
        <div className="os-row"><span className="k">Est. max slippage</span><span className="v">{fmtUsd(slippage, 2)}</span></div>
        <div className="os-row"><span className="k">Routed via</span><span className="v">SoDEX</span></div>
        <div className="os-row total"><span className="k">Est. total cost</span><span className="v">{fmtUsd(fees + slippage, 2)}</span></div>
      </div>

      <div className="risk-note">
        <Icon name="warn" sw={2} />
        <span>Demo only — no real funds move. In production you'd sign each trade in your wallet. Prices can change between quote and execution.</span>
      </div>
    </>
  )
}

const EXEC_STEPS = ["Building rebalance orders", "Routing through SoDEX", "Confirming on ValueChain"]

function ExecutingBody({ step }) {
  return (
    <div className="exec-state">
      <div className="exec-spinner"></div>
      <h2 style={{ fontSize: 20, fontWeight: 800 }}>Rebalancing…</h2>
      <p style={{ color: 'var(--text-mut)', marginTop: 6, fontSize: 14 }}>Keep this open while we place your orders.</p>
      <div className="exec-steps">
        {EXEC_STEPS.map((s, i) => (
          <div key={i} className={"exec-step " + (i < step ? "done" : i === step ? "active" : "")}>
            <span className="es-dot">{i < step ? <Icon name="checkSmall" sw={2.6} /> : <span style={{ width: 7, height: 7, borderRadius: 99, background: 'currentColor', opacity: i === step ? 1 : .3 }}></span>}</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

function SuccessBody({ orders, summary, onDone, onViewHistory }) {
  return (
    <div className="success-state">
      <div className="success-check"><Icon name="check" sw={2.6} /></div>
      <h2>Portfolio rebalanced</h2>
      <p>Your index is back on target. Nicely done.</p>
      <div className="success-summary">
        <div className="ss"><b>{orders.length}</b><span>trades placed</span></div>
        <div className="ss"><b>{fmtUsd(summary.volume, 0)}</b><span>volume</span></div>
        <div className="ss"><b style={{ color: 'var(--pos)' }}>100</b><span>health score</span></div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost btn-block" onClick={onViewHistory}>View history</button>
        <button className="btn btn-primary btn-block" onClick={onDone}>Back to dashboard</button>
      </div>
    </div>
  )
}

export default function RebalanceDrawer({ index, orders, summary, onClose, onComplete, onViewHistory }) {
  const [phase, setPhase] = useState('review') // review | executing | done
  const [step, setStep] = useState(0)
  const committed = useRef(false)

  function execute() {
    setPhase('executing')
    setStep(0)
    let i = 0
    const iv = setInterval(() => {
      i += 1
      if (i >= EXEC_STEPS.length) {
        clearInterval(iv)
        setTimeout(() => {
          setPhase('done')
          if (!committed.current) { committed.current = true; onComplete(orders, summary) }
        }, 520)
      } else {
        setStep(i)
      }
    }, 820)
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={phase === 'executing' ? undefined : onClose}></div>
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <h2>{phase === 'done' ? 'Done' : 'Review rebalance'}</h2>
          {phase !== 'executing' && (
            <button className="x" onClick={onClose} aria-label="Close"><Icon name="close" sw={2.2} /></button>
          )}
        </div>
        <div className="drawer-body">
          {phase === 'review' && <ReviewBody index={index} orders={orders} summary={summary} />}
          {phase === 'executing' && <ExecutingBody step={step} />}
          {phase === 'done' && <SuccessBody orders={orders} summary={summary} onDone={onClose} onViewHistory={onViewHistory} />}
        </div>
        {phase === 'review' && (
          <div className="drawer-foot">
            <button className="btn btn-primary btn-block btn-lg" onClick={execute}>
              <Icon name="bolt" sw={2} /> Confirm &amp; execute · {fmtUsd(summary.volume, 2)}
            </button>
            <button className="btn btn-subtle btn-block" style={{ marginTop: 8 }} onClick={onClose}>Cancel</button>
          </div>
        )}
      </aside>
    </>
  )
}
