/* ============================================================
   Index Aligner backend — index composition (source of truth)
   ------------------------------------------------------------
   Holds the static structure of each SSI index: which assets,
   their target weight, and the current (drifted) weight. Prices
   and 24h change are dynamic and merged in from the price client
   (see ./sosovalue.mjs), so this file stays purely structural.

   When SSI Protocol on-chain reads are wired up, the `current`
   weights here get replaced by the real holdings; `target` comes
   from the index definition. Until then these mirror the spec
   scenario (BTC 40→52, ETH 30→22, …).
   ============================================================ */

// `ssiTicker` maps our internal id → the SoSoValue SSI index ticker (e.g.
// "ssimag7"). When set (and an API key is present) the backend pulls real
// current constituent weights from the SSI module; null → demo weights.
// TODO: fill these in with the real tickers once confirmed.
export const INDEX_DEFS = [
  {
    id: 'top10',
    name: 'SSI Top 10 Index',
    symbol: 'SSI10',
    ssiTicker: null,
    desc: 'The ten largest crypto assets by market cap.',
    value: 1000,
    assets: [
      { sym: 'BTC',  name: 'Bitcoin',   color: '#f7931a', target: 40,  current: 52 },
      { sym: 'ETH',  name: 'Ethereum',  color: '#627eea', target: 30,  current: 22 },
      { sym: 'SOL',  name: 'Solana',    color: '#14b89a', target: 15,  current: 14 },
      { sym: 'LINK', name: 'Chainlink', color: '#2a5ada', target: 3,   current: 2.6 },
      { sym: 'AVAX', name: 'Avalanche', color: '#e84142', target: 3,   current: 2.4 },
      { sym: 'UNI',  name: 'Uniswap',   color: '#ff007a', target: 2,   current: 1.6 },
      { sym: 'AAVE', name: 'Aave',      color: '#b6509e', target: 2,   current: 1.6 },
      { sym: 'MKR',  name: 'Maker',     color: '#1aab9b', target: 2,   current: 1.5 },
      { sym: 'LDO',  name: 'Lido DAO',  color: '#00a3ff', target: 1.5, current: 1.1 },
      { sym: 'ARB',  name: 'Arbitrum',  color: '#28a0f0', target: 1.5, current: 1.2 }
    ]
  },
  {
    id: 'defi',
    name: 'SSI DeFi Blue Chip',
    symbol: 'SSIDFI',
    ssiTicker: null,
    desc: 'Leading decentralized-finance protocols.',
    value: 640,
    assets: [
      { sym: 'UNI',  name: 'Uniswap',   color: '#ff007a', target: 25, current: 25.4 },
      { sym: 'AAVE', name: 'Aave',      color: '#b6509e', target: 20, current: 20.3 },
      { sym: 'MKR',  name: 'Maker',     color: '#1aab9b', target: 18, current: 17.6 },
      { sym: 'LDO',  name: 'Lido DAO',  color: '#00a3ff', target: 15, current: 15.1 },
      { sym: 'CRV',  name: 'Curve',     color: '#ed1c24', target: 12, current: 11.8 },
      { sym: 'SNX',  name: 'Synthetix', color: '#5fcdf9', target: 10, current: 9.8 }
    ]
  }
];

// Every symbol referenced across all indexes (for a bulk price fetch).
export const ALL_SYMBOLS = [...new Set(INDEX_DEFS.flatMap(i => i.assets.map(a => a.sym)))];

// Merge live prices/changes into the structural defs.
// `prices` is a map of { SYM: { price, change } }.
export function buildIndexes(prices) {
  return INDEX_DEFS.map(def => ({
    ...def,
    assets: def.assets.map(a => {
      const p = prices[a.sym] || {};
      return {
        ...a,
        price: p.price ?? null,
        change: p.change ?? 0
      };
    })
  }));
}

export function getIndexById(id, prices) {
  return buildIndexes(prices).find(i => i.id === id) || null;
}
