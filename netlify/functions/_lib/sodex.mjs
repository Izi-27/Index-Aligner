/* ============================================================
   Index Aligner backend — SoDEX routing (quote + execute)
   ------------------------------------------------------------
   `quote`   — price a rebalance route (fees, slippage, total). Read
               only; no funds move.
   `execute` — place the rebalance. HARD DEMO GUARD: it only attempts
               a real, fund-moving route when BOTH a live key
               (SODEX_API_KEY) AND an explicit opt-in
               (EXECUTION_ENABLED=true) are set. Otherwise it returns
               a simulated success — nothing on-chain happens.

   In the live design, transaction SIGNING stays client-side in the
   user's wallet; this server step only quotes and prepares/relays
   the route. The live path is intentionally not implemented yet.
   ============================================================ */

const FEE_RATE = 0.001;      // 0.1% network + DEX fees
const SLIPPAGE_RATE = 0.0015; // 0.15% est. max slippage
const QUOTE_TTL_SEC = 30;

export const usingMockExecution = () =>
  !(process.env.SODEX_API_KEY && process.env.EXECUTION_ENABLED === 'true');

export function quote(orders, summary) {
  const fees = +(summary.volume * FEE_RATE).toFixed(2);
  const slippage = +(summary.volume * SLIPPAGE_RATE).toFixed(2);
  return {
    routedVia: 'SoDEX',
    volume: summary.volume,
    fees,
    slippage,
    estTotalCost: +(fees + slippage).toFixed(2),
    expiresInSec: QUOTE_TTL_SEC,
    orders: orders.map((o) => ({ sym: o.sym, side: o.side, usd: o.usd, tokens: o.tokens }))
  };
}

export async function execute({ address, orders, summary }) {
  const live = process.env.SODEX_API_KEY && process.env.EXECUTION_ENABLED === 'true';

  if (!live) {
    // DEMO: simulate a successful routed execution. No funds move.
    return {
      status: 'completed',
      simulated: true,
      routedVia: 'SoDEX',
      trades: orders.length,
      volume: summary.volume,
      txHashes: orders.map((o, i) => mockTxHash(`${address}:${o.sym}`, i)),
      executedAt: new Date().toISOString()
    };
  }

  // TODO(real): submit the route to SoDEX and return on-chain receipts.
  // Signing happens client-side; this only prepares/relays. Not implemented,
  // so we refuse rather than pretend — surfaces as a failure in the UI.
  throw new Error('Live execution is not enabled on this deployment');
}

// Deterministic fake 32-byte tx hash for demo receipts (no randomness).
function mockTxHash(seed, i) {
  let h = 2166136261 >>> 0;
  const s = `${seed}-${i}`;
  for (let c = 0; c < s.length; c++) {
    h ^= s.charCodeAt(c);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const hex = h.toString(16).padStart(8, '0').repeat(8).slice(0, 64);
  return '0x' + hex;
}
