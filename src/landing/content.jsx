import React from 'react'

/* ============================================================
   Index Aligner — landing page content (data-driven sections)
   ============================================================ */

/* Hero drift card rows */
export const DRIFT_ROWS = [
  { color: '#f7931a', sym: 'B', name: 'Bitcoin', targetLeft: '66.7%', w: '86.7%', cls: 'over', val: '52%', d: { cls: 'up', txt: '▲ +12' } },
  { color: '#627eea', sym: 'E', name: 'Ethereum', targetLeft: '50%', w: '36.7%', cls: 'under', val: '22%', d: { cls: 'down', txt: '▼ −8' } },
  { color: '#14b89a', sym: 'S', name: 'Solana', targetLeft: '25%', w: '23.3%', cls: 'ok', val: '14%', d: { cls: 'flat', txt: '— ok' } },
  { color: '#8b93a7', sym: '+7', name: 'Others', targetLeft: '25%', w: '20%', cls: 'ok', val: '12%', d: { cls: 'flat', txt: '— ok' } },
]

/* How it works steps */
export const STEPS = [
  {
    icon: <><rect x="2" y="6" width="20" height="13" rx="2.5"></rect><path d="M16 12h3"></path><path d="M2 9h15a2 2 0 0 1 2 2"></path></>,
    title: 'Connect your wallet',
    body: 'Link MetaMask. Index Aligner only ever reads — it can’t move funds without your signature.',
    src: 'MetaMask · Ethers.js',
  },
  {
    icon: <path d="M3 7h18M3 12h18M3 17h12"></path>,
    title: 'Read your holdings',
    body: 'We pull the exact composition of your SSI index position, directly from the chain.',
    src: 'SSI Protocol · on-chain',
  },
  {
    icon: <><path d="M3 17l6-6 4 4 8-8"></path><path d="M21 7v5h-5"></path></>,
    title: 'Fetch live prices',
    body: 'Real-time market data for every asset in your index, the moment you open the dashboard.',
    src: 'SoSoValue API',
  },
  {
    icon: <><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M8 7h8M8 12h8M8 17h5"></path></>,
    title: 'Calculate the drift',
    body: 'We compare your current weights to your target and flag everything that’s over or under.',
    src: 'Local computation',
  },
  {
    icon: <path d="M12 3v18M3 8l4-4 4 4M21 16l-4 4-4-4"></path>,
    title: 'Get exact orders',
    body: '“Sell $120 BTC, buy $120 ETH.” No percentages to interpret — just amounts to act on.',
    src: 'Algorithmic',
  },
  {
    icon: <path d="M5 12l5 5L20 7"></path>,
    title: 'Execute in one click',
    body: 'Confirm, and the trades route through SoDEX. Or just take the orders and trade them yourself.',
    src: 'SoDEX API · optional',
  },
]

/* Features — available now */
export const FEAT_NOW = [
  { icon: <path d="M3 17l6-6 4 4 8-8"></path>, h: 'Live price fetching', p: 'Real-time prices for every index asset, via the SoSoValue API.' },
  { icon: <><path d="M3 3v18h18"></path><path d="M7 14l3-3 3 3 5-6"></path></>, h: 'Deviation calculation', p: 'See exactly how far over or under target each asset has drifted.' },
  { icon: <path d="M12 3v18M3 8l4-4 4 4M21 16l-4 4-4-4"></path>, h: 'Rebalance orders', p: 'Precise buy and sell amounts in dollars — no math required.' },
  { icon: <><rect x="2" y="6" width="20" height="13" rx="2.5"></rect><path d="M16 12h3"></path></>, h: 'Wallet connection', p: 'Connect MetaMask in one tap. Read-only until you sign.' },
  { icon: <><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path></>, h: 'Clean dashboard', p: 'Your whole portfolio’s health, readable at a glance.' },
  { icon: <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path>, h: 'Risk warnings', p: 'Fees and slippage shown up front, with a confirm step before anything moves.' },
]

/* Features — coming soon */
export const FEAT_NEXT = [
  { icon: <path d="M13 2L3 14h7l-1 8 10-12h-7z"></path>, h: 'One-click execution', p: 'Route the whole rebalance through SoDEX without leaving the app.' },
  { icon: <><path d="M3 3v18h18"></path><circle cx="9" cy="9" r="1.5"></circle><circle cx="14" cy="13" r="1.5"></circle><circle cx="19" cy="7" r="1.5"></circle></>, h: 'Historical log', p: 'Every past rebalance, recorded and reviewable.' },
  { icon: <><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></>, h: 'Multiple index support', p: 'Track and rebalance any SSI index from one place.' },
  { icon: <><path d="M4 4h16v16H4z"></path><path d="m4 6 8 6 8-6"></path></>, h: 'Email alerts', p: 'Get notified the moment a rebalance is worth doing.' },
  { icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>, h: 'Dark mode', p: <>Easier on the eyes for late-night portfolio checks. <em>(Try the toggle ↑)</em></> },
]

/* Audience grid */
export const AUDIENCE = [
  { icon: <><path d="M12 14c4 0 7 1.6 7 3.5V20H5v-2.5C5 15.6 8 14 12 14z"></path><circle cx="12" cy="8" r="4"></circle></>, h: 'Beginners', p: 'Don’t know how to calculate deviations? You don’t have to.' },
  { icon: <><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path></>, h: 'Busy professionals', p: 'No time to monitor portfolios daily. We do it for you.' },
  { icon: <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path>, h: 'DAO treasuries', p: 'Systematic maintenance, with a transparent on-chain trail.' },
  { icon: <><path d="M3 3v18h18"></path><path d="M7 13l3-4 4 3 5-7"></path></>, h: 'Solo fund managers', p: 'Automation without hiring a team. A one-person fund.' },
  { icon: <path d="M13 2L3 14h7l-1 8 10-12h-7z"></path>, h: 'DeFi power users', p: 'Stay true to your index strategy without the manual grind.' },
]

/* Header nav */
export const NAV_SECTIONS = ['problem', 'how', 'features', 'audience']
export const NAV_LINKS = [
  { id: 'problem', label: 'The problem' },
  { id: 'how', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'audience', label: "Who it's for" },
]
