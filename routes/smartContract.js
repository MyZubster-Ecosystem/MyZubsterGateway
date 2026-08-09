const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory blockchain state
const balances = {};
const transactions = [];
const escrows = {};

/**
 * 1. Token Minting
 */
router.post('/mint', (req, res) => {
    const { address, amount } = req.body;
    
    if (!address || !amount) {
        return res.status(400).json({ error: 'Address and amount are required' });
    }

    balances[address] = (balances[address] || 0) + amount;
    
    const tx = {
        txId: crypto.randomUUID(),
        type: 'MINT',
        to: address,
        amount,
        timestamp: new Date().toISOString()
    };
    transactions.push(tx);

    res.json({ success: true, message: 'Tokens minted successfully', tx });
});

/**
 * 2. Token Transfer
 */
router.post('/transfer', (req, res) => {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'from, to, and amount are required' });
    }

    if ((balances[from] || 0) < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }

    balances[from] -= amount;
    balances[to] = (balances[to] || 0) + amount;

    const tx = {
        txId: crypto.randomUUID(),
        type: 'TRANSFER',
        from,
        to,
        amount,
        timestamp: new Date().toISOString()
    };
    transactions.push(tx);

    res.json({ success: true, message: 'Transfer successful', tx });
});

/**
 * 3. Balance Tracking
 */
router.get('/balance/:address', (req, res) => {
    const { address } = req.params;
    res.json({ address, balance: balances[address] || 0 });
});

/**
 * 4. Transaction History
 */
router.get('/transactions', (req, res) => {
    res.json({ transactions: transactions.slice(-50) }); // Last 50 tx
});

/**
 * 5. Escrow 2-of-3
 */
router.post('/escrow/create', (req, res) => {
    const { buyer, seller, arbitrator, amount } = req.body;

    if ((balances[buyer] || 0) < amount) {
        return res.status(400).json({ error: 'Insufficient balance for escrow' });
    }

    // Deduct from buyer
    balances[buyer] -= amount;

    const escrowId = crypto.randomUUID();
    escrows[escrowId] = {
        escrowId,
        buyer,
        seller,
        arbitrator,
        amount,
        status: 'pending', // pending, resolved, refunded
        approvals: []
    };

    res.json({ success: true, escrow: escrows[escrowId] });
});

router.post('/escrow/:id/approve', (req, res) => {
    const { id } = req.params;
    const { signer } = req.body;
    
    const escrow = escrows[id];
    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });
    if (escrow.status !== 'pending') return res.status(400).json({ error: 'Escrow is closed' });

    if (![escrow.buyer, escrow.seller, escrow.arbitrator].includes(signer)) {
        return res.status(403).json({ error: 'Invalid signer' });
    }

    if (!escrow.approvals.includes(signer)) {
        escrow.approvals.push(signer);
    }

    // 2-of-3 logic
    if (escrow.approvals.length >= 2) {
        escrow.status = 'resolved';
        balances[escrow.seller] = (balances[escrow.seller] || 0) + escrow.amount;
        return res.json({ success: true, message: 'Escrow resolved, funds sent to seller', escrow });
    }

    res.json({ success: true, message: 'Approval recorded', escrow });
});

module.exports = router;
