/**
 * Transaction verifier for bounty settlements.
 *
 * In simulation mode, verification is deterministic and does not
 * touch any external network. In network mode, this is a stub for
 * real chain explorers / RPC checks.
 */

class SimulationVerifier {
  verify({ txId, network, asset }) {
    if (!txId) {
      return { status: 'unverified', detail: 'missing txId' };
    }
    // Deterministic synthetic verification for test/simulation use.
    return { status: 'verified', detail: `simulated verification on ${network} for ${asset}` };
  }
}

class NetworkVerifier {
  verify({ txId, network, asset }) {
    // TODO: replace with real explorer/RPC verification.
    return { status: 'pending', detail: 'network verifier not implemented' };
  }
}

function createVerifier() {
  const mode = (process.env.BOUNTY_SETTLEMENT_MODE || 'simulation').toLowerCase();
  if (mode === 'network') {
    return new NetworkVerifier();
  }
  return new SimulationVerifier();
}

module.exports = { createVerifier };
