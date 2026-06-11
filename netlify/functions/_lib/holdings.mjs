/* ============================================================
   Index Aligner backend — wallet holdings (SSI Protocol)
   ------------------------------------------------------------
   Returns a connected wallet's actual position in an SSI index:
   the total USD value and the CURRENT constituent weights (the
   drift). Conceptually:

     • target weights        → the index design  (see indexes.mjs)
     • current weights + value → THIS wallet's real position (here)

   Real implementation (TODO, isolated below):
     1. Read the wallet's SSI index-token balance on-chain
        (ethers + SSI_RPC_URL + the SSI index contract).
     2. Multiply by NAV for `value`.
     3. Pull live constituent weights from the SSI market snapshot
        (SoSoValue "SosoValue Index (SSI)" module).

   Until SSI_RPC_URL is configured we return the demo drifted
   positions so the connect → dashboard flow works end-to-end.
   ============================================================ */
import { INDEX_DEFS } from './indexes.mjs'
import { ssiAvailable, getConstituentWeights } from './ssi.mjs'

const RPC_URL = process.env.SSI_RPC_URL || '';

// "Mock" here means the wallet VALUE isn't from a real on-chain balance.
// (Current weights can still be live via the SSI module — see below.)
export const usingMockHoldings = () => !RPC_URL;

function mockHolding(def) {
  return {
    indexId: def.id,
    name: def.name,
    value: def.value,
    // current (drifted) weight per asset symbol
    weights: Object.fromEntries(def.assets.map(a => [a.sym, a.current]))
  };
}

// Real current constituent weights from the SSI module (when a ticker + key
// exist), otherwise the demo weights. The wallet's USD VALUE still comes from
// the demo until on-chain balance reads are wired.
// TODO(value): read the wallet's SSI index-token balance via ethers against
// SSI_RPC_URL and multiply by the index NAV (ssi.getIndexSnapshot) for `value`.
async function holdingFor(def) {
  if (ssiAvailable() && def.ssiTicker) {
    try {
      const weights = await getConstituentWeights(def.ssiTicker);
      if (weights && Object.keys(weights).length) {
        return { indexId: def.id, name: def.name, value: def.value, weights };
      }
    } catch (err) {
      console.error(`SSI constituents failed for ${def.id}, using demo:`, err.message);
    }
  }
  return mockHolding(def);
}

/**
 * Holdings for `address`. If `indexId` is given, returns just that index's
 * position; otherwise every index. Returns an array of
 * { indexId, name, value, weights: { SYM: currentWeight } }.
 */
export async function getHoldings(address, indexId) {
  const defs = indexId ? INDEX_DEFS.filter(d => d.id === indexId) : INDEX_DEFS;
  // (address is used by the on-chain VALUE read once wired; weights are
  // index-level and come from the SSI module.)
  return Promise.all(defs.map(holdingFor));
}
