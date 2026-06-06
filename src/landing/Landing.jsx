import React, { useEffect, useRef, useState } from 'react'
import { LogoMark, ArrowRight } from '../components/Logo.jsx'
import { toggleTheme } from '../lib/theme.js'
import { DRIFT_ROWS, STEPS, FEAT_NOW, FEAT_NEXT, AUDIENCE, NAV_SECTIONS, NAV_LINKS } from './content.jsx'

export default function Landing() {
  const [activeNav, setActiveNav] = useState(null)
  const barRefs = useRef([])

  // Animate hero drift bars in on mount
  useEffect(() => {
    const timers = []
    requestAnimationFrame(() => {
      barRefs.current.forEach((el, i) => {
        if (!el) return
        timers.push(setTimeout(() => { el.style.width = el.dataset.w }, 120 + i * 110))
      })
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  // Active nav highlight on scroll
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const els = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* ============ HEADER ============ */}
      <header className="site-header">
        <div className="container nav">
          <a className="brandmark" href="index.html" aria-label="Index Aligner home">
            <LogoMark />
            Index Aligner
          </a>
          <nav className="nav-links">
            {NAV_LINKS.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={activeNav === l.id ? 'active' : undefined}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav-right">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>
            </button>
            <a className="btn btn-primary" href="app.html">Open App</a>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="pill pill-brand"><span className="dot"></span>Built on SoSoValue · SSI Protocol</span>
            <h1>Keep your index portfolio <span className="grad">balanced</span> — automatically.</h1>
            <p className="hero-sub">Your SSI index drifts the moment the market moves. Index Aligner watches the live prices, spots the drift, and tells you exactly what to buy and sell — then rebalances in one click.</p>
            <div className="hero-cta">
              <a className="btn btn-primary btn-lg" href="app.html">Try the live demo
                <ArrowRight width="18" height="18" />
              </a>
              <a className="btn btn-ghost btn-lg" href="#how">See how it works</a>
            </div>
            <div className="hero-meta">
              <span><b>No math.</b> No spreadsheets.</span>
              <span className="sep"></span>
              <span>If you can use MetaMask, you can use this.</span>
            </div>
          </div>

          {/* hero drift card */}
          <div className="hero-card" aria-label="Portfolio drift preview">
            <div className="hero-card-head">
              <div>
                <div className="t">SSI Top 10 Index</div>
                <div className="s mono">$1,000.00 · drifted 1 month ago</div>
              </div>
              <span className="pill pill-warn" style={{ fontSize: 12, padding: '5px 10px' }}>Rebalance needed</span>
            </div>
            <div className="drift-rows">
              {DRIFT_ROWS.map((r, i) => (
                <div className="drift-row" key={r.name}>
                  <div className="drift-asset"><span className="coin" style={{ background: r.color }}>{r.sym}</span>{r.name}</div>
                  <div className="bar-track">
                    <span className="bar-target" style={{ left: r.targetLeft }}></span>
                    <span
                      className={`bar-fill ${r.cls}`}
                      data-w={r.w}
                      style={{ width: 0 }}
                      ref={(el) => { barRefs.current[i] = el }}
                    ></span>
                  </div>
                  <div className="drift-val">{r.val}<span className={`d ${r.d.cls}`}>{r.d.txt}</span></div>
                </div>
              ))}
            </div>
            <div className="hero-card-foot">
              <div className="fix">Fix: <span className="mono">Sell $120 BTC</span> → <span className="mono buy">Buy $120 ETH</span></div>
              <a href="app.html" className="mini-btn">Rebalance</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <div className="trust">
        <div className="container trust-inner">
          <span>The research-to-execution stack:</span>
          <span className="trust-logo">SoSoValue Terminal</span>
          <span className="trust-logo">SSI Protocol</span>
          <span className="trust-logo">SoDEX</span>
          <span className="trust-logo">ValueChain L1</span>
        </div>
      </div>

      {/* ============ PROBLEM ============ */}
      <section className="section" id="problem">
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">The problem</span>
            <h2>Your index drifts. You don't notice. Your strategy breaks.</h2>
            <p>You bought $1,000 of the SSI Top 10 Index at clean target weights. A month later, Bitcoin pumped and Ethereum dipped — and now you're holding something you never chose.</p>
          </div>

          <div className="scenario">
            <div className="scn-card">
              <h3><span className="coin" style={{ background: 'var(--pos)', width: 18, height: 18, fontSize: 0 }}>·</span>Target weights</h3>
              <div className="when">Day 0 — the index you bought</div>
              <div className="scn-list">
                <div className="scn-item"><span className="nm"><span className="coin" style={{ background: '#f7931a', width: 20, height: 20, fontSize: 9 }}>B</span>Bitcoin</span><span className="pct">40%</span><span className="tag ok">on target</span></div>
                <div className="scn-item"><span className="nm"><span className="coin" style={{ background: '#627eea', width: 20, height: 20, fontSize: 9 }}>E</span>Ethereum</span><span className="pct">30%</span><span className="tag ok">on target</span></div>
                <div className="scn-item"><span className="nm"><span className="coin" style={{ background: '#14b89a', width: 20, height: 20, fontSize: 9 }}>S</span>Solana</span><span className="pct">15%</span><span className="tag ok">on target</span></div>
                <div className="scn-item"><span className="nm"><span className="coin" style={{ background: '#8b93a7', width: 20, height: 20, fontSize: 9 }}>+7</span>Other 7 coins</span><span className="pct">15%</span><span className="tag ok">on target</span></div>
              </div>
            </div>

            <div className="scn-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
            </div>

            <div className="scn-card">
              <h3><span className="coin" style={{ background: 'var(--warn)', width: 18, height: 18, fontSize: 0 }}>·</span>One month later</h3>
              <div className="when">After the market moved</div>
              <div className="scn-list">
                <div className="scn-item"><span className="nm"><span className="coin" style={{ background: '#f7931a', width: 20, height: 20, fontSize: 9 }}>B</span>Bitcoin</span><span className="pct">52%</span><span className="tag heavy">⚠ too heavy</span></div>
                <div className="scn-item"><span className="nm"><span className="coin" style={{ background: '#627eea', width: 20, height: 20, fontSize: 9 }}>E</span>Ethereum</span><span className="pct">22%</span><span className="tag light">⚠ too light</span></div>
                <div className="scn-item"><span className="nm"><span className="coin" style={{ background: '#14b89a', width: 20, height: 20, fontSize: 9 }}>S</span>Solana</span><span className="pct">14%</span><span className="tag ok">✓ okay</span></div>
                <div className="scn-item"><span className="nm"><span className="coin" style={{ background: '#8b93a7', width: 20, height: 20, fontSize: 9 }}>+7</span>Other 7 coins</span><span className="pct">12%</span><span className="tag ok">✓ okay</span></div>
              </div>
            </div>
          </div>

          <div className="solution-band">
            <div className="sol-txt">Index Aligner does the math instantly: <b className="sell">Sell <span className="mono">$120</span> Bitcoin</b> → <b className="buy">Buy <span className="mono">$120</span> Ethereum</b>. One click. Back on target.</div>
            <a className="btn btn-primary" href="app.html">Rebalance mine</a>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section" id="how" style={{ background: 'var(--bg-tint)', borderBlock: '1px solid var(--border)' }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">How it works</span>
            <h2>From wallet to balanced in six steps</h2>
            <p>You connect once. Index Aligner handles the reading, the fetching, and the math — and never moves a coin without your confirmation.</p>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <article className="step" key={s.title}>
                <span className="step-num"></span>
                <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg></span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <div className="src">{s.src}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="section" id="features">
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Features</span>
            <h2>Everything you need to stay on target</h2>
            <p>Core rebalancing is live today. One-click execution and automation are landing next.</p>
          </div>
          <div className="feat-wrap">
            <div className="feat-block">
              <h3><span className="pill pill-pos" style={{ padding: '4px 10px' }}>Available now</span></h3>
              <div className="feat-list">
                {FEAT_NOW.map((f) => (
                  <div className="feat" key={f.h}>
                    <span className="fic now"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg></span>
                    <div><h4>{f.h}</h4><p>{f.p}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="feat-block">
              <h3><span className="pill" style={{ padding: '4px 10px' }}>Coming soon</span></h3>
              <div className="feat-list">
                {FEAT_NEXT.map((f) => (
                  <div className="feat" key={f.h}>
                    <span className="fic next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg></span>
                    <div><h4>{f.h}</h4><p>{f.p}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AUDIENCE ============ */}
      <section className="section" id="audience" style={{ background: 'var(--bg-tint)', borderBlock: '1px solid var(--border)' }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">Who it's for</span>
            <h2>Built for anyone holding an index</h2>
            <p>No prior experience required. If you can use MetaMask, you can use Index Aligner.</p>
          </div>
          <div className="aud-grid">
            {AUDIENCE.map((a) => (
              <div className="aud" key={a.h}>
                <span className="ac"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{a.icon}</svg></span>
                <h4>{a.h}</h4>
                <p>{a.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Stop drifting. Start aligning.</h2>
            <p>Open the live demo, connect a sample wallet, and watch Index Aligner pull your portfolio back to target.</p>
            <a className="btn btn-lg" href="app.html">Launch Index Aligner
              <ArrowRight width="18" height="18" />
            </a>
            <div className="no-card">Demo mode · no real funds · no signup</div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <a className="brandmark" href="index.html">
                <LogoMark />
                Index Aligner
              </a>
              <p className="footer-blurb">Keep your SSI index portfolio at its target weights — automatically. A SoSoValue Buildathon project.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href="app.html">Open App</a>
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#problem">The problem</a>
            </div>
            <div className="footer-col">
              <h4>Built with</h4>
              <a href="https://sosovalue-1.gitbook.io/sosovalue-api-doc" target="_blank" rel="noopener">SoSoValue API</a>
              <a href="#">SSI Protocol</a>
              <a href="#">SoDEX</a>
              <a href="#">ValueChain L1</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Buildathon</a>
              <a href="#">GitHub</a>
              <a href="#">Support</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Index Aligner. Demo build for the SoSoValue Buildathon.</span>
            <span className="mono">Not financial advice · Demo data</span>
          </div>
        </div>
      </footer>
    </>
  )
}
