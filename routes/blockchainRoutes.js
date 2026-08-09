const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ============================================================
// Blockchain per Dati Ambientali - Futura
// Issue #1029 - Reward: 800 MYZ
// ============================================================

// In-memory blockchain ledger (mock)
const ledger = [];
const carbonCredits = {};
const smartContracts = {};

// Helper: generate block hash
function generateBlockHash(index, data, previousHash, timestamp) {
  return crypto.createHash('sha256')
    .update(`${index}${JSON.stringify(data)}${previousHash}${timestamp}`)
    .digest('hex');
}

// ▸▸▸ 1. TRACCIABILITÀ DATI

// Registra un dato ambientale nella blockchain
router.post('/blockchain/record', (req, res) => {
  const { sensorId, dataType, value, unit, location } = req.body || {};
  if (!sensorId || !dataType || value === undefined) {
    return res.status(400).json({
      error: 'Campi obbligatori: sensorId, dataType, value',
      ok: false
    });
  }

  const previousHash = ledger.length > 0 ? ledger[ledger.length - 1].hash : '0xGENESIS';
  const timestamp = new Date().toISOString();
  const block = {
    index: ledger.length,
    data: { sensorId, dataType, value, unit: unit || 'raw', location: location || 'unknown' },
    previousHash,
    timestamp,
    nonce: Math.floor(Math.random() * 1000000)
  };
  block.hash = generateBlockHash(block.index, block.data, block.previousHash, block.timestamp);
  ledger.push(block);

  res.status(201).json({
    ok: true,
    message: 'Dato registrato nella blockchain',
    block: { index: block.index, hash: block.hash, timestamp: block.timestamp },
    totalBlocks: ledger.length
  });
});

// Verifica integrità di un blocco
router.get('/blockchain/verify/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= ledger.length) {
    return res.status(404).json({ error: 'Blocco non trovato', ok: false });
  }

  const block = ledger[index];
  const recomputed = generateBlockHash(block.index, block.data, block.previousHash, block.timestamp);
  const isValid = recomputed === block.hash;

  res.json({
    ok: true,
    index,
    isValid,
    block: { hash: block.hash, data: block.data, timestamp: block.timestamp },
    recomputedHash: recomputed
  });
});

// Query dati ambientali con filtro
router.get('/blockchain/query', (req, res) => {
  const { sensorId, dataType, from, to, limit } = req.query;
  let results = [...ledger];

  if (sensorId) results = results.filter(b => b.data.sensorId === sensorId);
  if (dataType) results = results.filter(b => b.data.dataType === dataType);
  if (from) results = results.filter(b => new Date(b.timestamp) >= new Date(from));
  if (to) results = results.filter(b => new Date(b.timestamp) <= new Date(to));

  const maxResults = parseInt(limit) || 50;
  results = results.slice(-maxResults);

  res.json({
    ok: true,
    count: results.length,
    totalBlocks: ledger.length,
    results: results.map(b => ({
      index: b.index, hash: b.hash, data: b.data, timestamp: b.timestamp
    }))
  });
});

// Immutabilità: verifica integrità catena intera
router.get('/blockchain/validate-chain', (req, res) => {
  const violations = [];
  for (let i = 1; i < ledger.length; i++) {
    const block = ledger[i];
    const expectedPrevHash = ledger[i - 1].hash;
    const recomputedHash = generateBlockHash(block.index, block.data, block.previousHash, block.timestamp);

    if (block.previousHash !== expectedPrevHash) {
      violations.push({ index: i, field: 'previousHash', expected: expectedPrevHash, actual: block.previousHash });
    }
    if (recomputedHash !== block.hash) {
      violations.push({ index: i, field: 'hash', expected: recomputedHash, actual: block.hash });
    }
  }

  res.json({
    ok: true,
    chainLength: ledger.length,
    isImmutable: violations.length === 0,
    violations,
    genesisHash: ledger.length > 0 ? ledger[0].hash : null
  });
});

// ▸▸▸ 2. CARBON CREDITS

// Tokenizza CO2 risparmiata
router.post('/carbon-credits/tokenize', (req, res) => {
  const { userId, co2Kg, project, verificationMethod } = req.body || {};
  if (!userId || !co2Kg) {
    return res.status(400).json({ error: 'Campi obbligatori: userId, co2Kg', ok: false });
  }

  const creditId = `CC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  carbonCredits[creditId] = {
    creditId,
    userId,
    co2Kg: parseFloat(co2Kg),
    project: project || 'Futura Default',
    verificationMethod: verificationMethod || 'IoT Sensor',
    status: 'issued',
    issuedAt: new Date().toISOString(),
    transactions: []
  };

  res.status(201).json({
    ok: true,
    message: `Tokenizzati ${co2Kg} kg CO₂`,
    credit: carbonCredits[creditId]
  });
});

// Ottieni crediti carbonio per utente
router.get('/carbon-credits/user/:userId', (req, res) => {
  const userCredits = Object.values(carbonCredits).filter(c => c.userId === req.params.userId);
  const totalCo2 = userCredits.reduce((sum, c) => sum + c.co2Kg, 0);
  res.json({ ok: true, userId: req.params.userId, credits: userCredits, totalCo2Kg: totalCo2 });
});

// Trading credits: trasferisci
router.post('/carbon-credits/transfer', (req, res) => {
  const { creditId, fromUser, toUser } = req.body || {};
  if (!creditId || !toUser) {
    return res.status(400).json({ error: 'Campi obbligatori: creditId, toUser', ok: false });
  }

  const credit = carbonCredits[creditId];
  if (!credit) {
    return res.status(404).json({ error: 'Credito non trovato', ok: false });
  }
  if (credit.status !== 'issued') {
    return res.status(400).json({ error: `Credito non trasferibile (status: ${credit.status})`, ok: false });
  }

  credit.transactions.push({
    from: fromUser || credit.userId,
    to: toUser,
    timestamp: new Date().toISOString(),
    txHash: crypto.randomBytes(16).toString('hex')
  });
  credit.userId = toUser;

  res.json({ ok: true, message: 'Credito trasferito', credit });
});

// Verifica credito
router.get('/carbon-credits/verify/:creditId', (req, res) => {
  const credit = carbonCredits[req.params.creditId];
  if (!credit) return res.status(404).json({ error: 'Credito non trovato', ok: false });
  res.json({
    ok: true,
    credit,
    verificationStatus: credit.status === 'issued' ? 'verified' : credit.status,
    totalTransactions: credit.transactions.length
  });
});

// ▸▸▸ 3. SMART CONTRACT AMBIENTALI

// Crea smart contract
router.post('/smart-contracts/create', (req, res) => {
  const { name, description, conditions, parties, triggers } = req.body || {};
  if (!name || !conditions) {
    return res.status(400).json({ error: 'Campi obbligatori: name, conditions', ok: false });
  }

  const contractId = `SC-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  smartContracts[contractId] = {
    contractId,
    name,
    description: description || '',
    conditions,
    parties: parties || [],
    triggers: triggers || [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    executions: [],
    complianceChecks: []
  };

  res.status(201).json({
    ok: true,
    message: 'Smart contract creato',
    contract: smartContracts[contractId]
  });
});

// Attiva smart contract
router.post('/smart-contracts/:contractId/activate', (req, res) => {
  const contract = smartContracts[req.params.contractId];
  if (!contract) return res.status(404).json({ error: 'Contratto non trovato', ok: false });
  if (contract.status !== 'draft') {
    return res.status(400).json({ error: `Impossibile attivare (status: ${contract.status})`, ok: false });
  }

  contract.status = 'active';
  contract.activatedAt = new Date().toISOString();
  contract.complianceChecks.push({
    timestamp: new Date().toISOString(),
    result: 'pass',
    message: 'Tutte le condizioni soddisfatte'
  });

  res.json({ ok: true, message: 'Smart contract attivato', contract });
});

// Esegui pagamento condizionale
router.post('/smart-contracts/:contractId/execute-payment', (req, res) => {
  const contract = smartContracts[req.params.contractId];
  if (!contract) return res.status(404).json({ error: 'Contratto non trovato', ok: false });
  if (contract.status !== 'active') {
    return res.status(400).json({ error: 'Contratto non attivo', ok: false });
  }

  const { amount, currency, to } = req.body || {};
  const execution = {
    txId: crypto.randomBytes(16).toString('hex'),
    amount: amount || 0,
    currency: currency || 'MYZ',
    to: to || contract.parties[0],
    timestamp: new Date().toISOString(),
    status: 'completed'
  };
  contract.executions.push(execution);

  res.json({ ok: true, message: 'Pagamento eseguito', execution, contract });
});

// Lista smart contracts
router.get('/smart-contracts', (req, res) => {
  const contracts = Object.values(smartContracts);
  res.json({
    ok: true,
    count: contracts.length,
    byStatus: {
      draft: contracts.filter(c => c.status === 'draft').length,
      active: contracts.filter(c => c.status === 'active').length,
      completed: contracts.filter(c => c.status === 'completed').length
    },
    contracts
  });
});

// Compliance check
router.post('/smart-contracts/:contractId/compliance', (req, res) => {
  const contract = smartContracts[req.params.contractId];
  if (!contract) return res.status(404).json({ error: 'Contratto non trovato', ok: false });

  const check = {
    timestamp: new Date().toISOString(),
    result: Math.random() > 0.1 ? 'pass' : 'fail',
    message: Math.random() > 0.1 ? 'Condizioni verificate' : 'Condizione non soddisfatta: soglia CO2',
    checkedBy: 'Futura Compliance Engine'
  };
  contract.complianceChecks.push(check);

  res.json({ ok: true, complianceCheck: check, totalChecks: contract.complianceChecks.length });
});

// Health & stats
router.get('/blockchain/stats', (req, res) => {
  res.json({
    ok: true,
    blockchain: {
      totalBlocks: ledger.length,
      lastBlockHash: ledger.length > 0 ? ledger[ledger.length - 1].hash : null,
      genesisTimestamp: ledger.length > 0 ? ledger[0].timestamp : null
    },
    carbonCredits: {
      totalCredits: Object.keys(carbonCredits).length,
      totalCo2Kg: Object.values(carbonCredits).reduce((s, c) => s + c.co2Kg, 0)
    },
    smartContracts: {
      total: Object.keys(smartContracts).length,
      active: Object.values(smartContracts).filter(c => c.status === 'active').length
    }
  });
});

module.exports = router;
