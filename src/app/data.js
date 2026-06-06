/* ============================================================
   Index Aligner — mock data + rebalance math
   ============================================================ */

// Each asset: target % and current (drifted) %.  Prices are plausible June-2026 marks.
// SSI Top 10 mirrors the spec scenario: BTC 40→52, ETH 30→22, SOL 15→14, others 15→12.
const TOP10 = {
  id: 'top10',
  name: 'SSI Top 10 Index',
  symbol: 'SSI10',
  desc: 'The ten largest crypto assets by market cap.',
  value: 1000,
  assets: [
    { sym: 'BTC',  name: 'Bitcoin',   color: '#f7931a', price: 108240, change: +18.2, target: 40,  current: 52 },
    { sym: 'ETH',  name: 'Ethereum',  color: '#627eea', price: 4218,   change: -9.4,  target: 30,  current: 22 },
    { sym: 'SOL',  name: 'Solana',    color: '#14b89a', price: 184.6,  change: -2.1,  target: 15,  current: 14 },
    { sym: 'LINK', name: 'Chainlink', color: '#2a5ada', price: 21.8,   change: -5.0,  target: 3,   current: 2.6 },
    { sym: 'AVAX', name: 'Avalanche', color: '#e84142', price: 41.5,   change: -3.2,  target: 3,   current: 2.4 },
    { sym: 'UNI',  name: 'Uniswap',   color: '#ff007a', price: 13.9,   change: -4.1,  target: 2,   current: 1.6 },
    { sym: 'AAVE', name: 'Aave',      color: '#b6509e', price: 142.3,  change: -6.0,  target: 2,   current: 1.6 },
    { sym: 'MKR',  name: 'Maker',     color: '#1aab9b', price: 1948,   change: -3.5,  target: 2,   current: 1.5 },
    { sym: 'LDO',  name: 'Lido DAO',  color: '#00a3ff', price: 2.42,   change: -7.2,  target: 1.5, current: 1.1 },
    { sym: 'ARB',  name: 'Arbitrum',  color: '#28a0f0', price: 1.08,   change: -8.8,  target: 1.5, current: 1.2 }
  ]
};

// A second index that is essentially on-target (shows the "balanced" state).
const DEFI = {
  id: 'defi',
  name: 'SSI DeFi Blue Chip',
  symbol: 'SSIDFI',
  desc: 'Leading decentralized-finance protocols.',
  value: 640,
  assets: [
    { sym: 'UNI',  name: 'Uniswap',   color: '#ff007a', price: 13.9,  change: +1.1, target: 25, current: 25.4 },
    { sym: 'AAVE', name: 'Aave',      color: '#b6509e', price: 142.3, change: +2.0, target: 20, current: 20.3 },
    { sym: 'MKR',  name: 'Maker',     color: '#1aab9b', price: 1948,  change: -0.6, target: 18, current: 17.6 },
    { sym: 'LDO',  name: 'Lido DAO',  color: '#00a3ff', price: 2.42,  change: +0.4, target: 15, current: 15.1 },
    { sym: 'CRV',  name: 'Curve',     color: '#ed1c24', price: 0.71,  change: -0.9, target: 12, current: 11.8 },
    { sym: 'SNX',  name: 'Synthetix', color: '#5fcdf9', price: 2.31,  change: +0.2, target: 10, current: 9.8 }
  ]
};

export const INDEXES = [TOP10, DEFI];

// Build computed rows for an index.
export function rows(index, tolerance) {
  const tol = (tolerance == null) ? 5 : tolerance;
  return index.assets.map(function (a) {
    const curUsd = (a.current / 100) * index.value;
    const tgtUsd = (a.target / 100) * index.value;
    const dev = +(a.current - a.target).toFixed(2);          // weight points
    const deltaUsd = +(tgtUsd - curUsd).toFixed(2);          // + => buy, - => sell
    let status = 'ok';
    if (Math.abs(dev) >= tol) status = dev > 0 ? 'over' : 'under';
    return {
      sym: a.sym, name: a.name, color: a.color, price: a.price, change: a.change,
      target: a.target, current: a.current,
      curUsd: curUsd, tgtUsd: tgtUsd, dev: dev, deltaUsd: deltaUsd, status: status,
      tokens: +(Math.abs(deltaUsd) / a.price)
    };
  });
}

// Orders worth acting on (above a small $ floor).
export function orders(index, tolerance, floor) {
  floor = floor == null ? 1 : floor;
  const rs = rows(index, tolerance);
  const os = rs.filter(function (r) { return Math.abs(r.deltaUsd) >= floor; })
               .map(function (r) {
                 return {
                   sym: r.sym, name: r.name, color: r.color, price: r.price,
                   side: r.deltaUsd < 0 ? 'sell' : 'buy',
                   usd: +Math.abs(r.deltaUsd).toFixed(2),
                   tokens: r.tokens
                 };
               });
  // big trades first
  os.sort(function (a, b) { return b.usd - a.usd; });
  return os;
}

export function summary(index, tolerance) {
  const rs = rows(index, tolerance);
  const off = rs.filter(function (r) { return r.status !== 'ok'; });
  const maxDev = rs.reduce(function (m, r) { return Math.max(m, Math.abs(r.dev)); }, 0);
  const volume = rs.reduce(function (s, r) { return s + Math.max(0, -r.deltaUsd); }, 0); // total sell side = total buy side
  // health score: 100 when perfectly aligned, lower as drift grows
  const totalDrift = rs.reduce(function (s, r) { return s + Math.abs(r.dev); }, 0);
  const score = Math.max(0, Math.round(100 - totalDrift * 1.6));
  return {
    offCount: off.length,
    maxDev: +maxDev.toFixed(1),
    volume: +volume.toFixed(2),
    score: score,
    balanced: off.length === 0,
    total: index.value
  };
}

// Return a deep clone with all current weights set to target (post-rebalance).
export function aligned(index) {
  const clone = JSON.parse(JSON.stringify(index));
  clone.assets.forEach(function (a) { a.current = a.target; a.change = a.change; });
  return clone;
}

// Seed history
export const SEED_HISTORY = [
  { id: 'h1', index: 'SSI Top 10 Index', date: 'May 2, 2026 · 09:14', trades: 6, volume: 84.20, drift: 9.1, status: 'completed' },
  { id: 'h2', index: 'SSI DeFi Blue Chip', date: 'Apr 18, 2026 · 16:40', trades: 4, volume: 31.50, drift: 6.4, status: 'completed' },
  { id: 'h3', index: 'SSI Top 10 Index', date: 'Mar 30, 2026 · 11:02', trades: 7, volume: 122.75, drift: 12.8, status: 'completed' }
];

export function fmtUsd(n, dp) {
  dp = dp == null ? 2 : dp;
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
export function fmtPrice(p) {
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + p.toFixed(3);
}
export function fmtTokens(t) {
  if (t >= 1) return t.toLocaleString('en-US', { maximumFractionDigits: 3 });
  if (t >= 0.001) return t.toFixed(4);
  return t.toFixed(6);
}
