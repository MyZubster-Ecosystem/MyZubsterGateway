'use strict';

/**
 * Default settlement adapter.
 *
 * SECURITY BOUNDARY:
 * This adapter deliberately cannot move real funds.
 * Escrow/payment lifecycle operations only update internal accounting state.
 * Any real external settlement must use a separately verified adapter and
 * explicit human authorization.
 */
class DisabledSettlementAdapter {
    constructor() {
        this.enabled = false;
    }

    async settle() {
        throw new Error(
            'External settlement is disabled by default'
        );
    }
}

module.exports = { DisabledSettlementAdapter };