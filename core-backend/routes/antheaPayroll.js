// routes/antheaPayroll.js - Rotte API per Sistema Payroll Anthea
const express = require('express');
const router = express.Router();
const {
  Dipendente, Cedolino, Pagamento, F24,
  generaCedolino, generaCedoliniBatch, reportMensile, db
} = require('../services/antheaPayrollService');

// ==================== DIPENDENTI ====================

// GET /api/anthea/payroll/dipendenti
router.get('/dipendenti', async (req, res) => {
  try {
    const dipendenti = await Dipendente.findAll();
    res.json({ count: dipendenti.length, data: dipendenti });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/anthea/payroll/dipendenti
router.post('/dipendenti', async (req, res) => {
  try {
    const dipendente = await Dipendente.create(req.body);
    res.status(201).json({ message: 'Dipendente creato', data: dipendente });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/anthea/payroll/dipendenti/:id
router.get('/dipendenti/:id', async (req, res) => {
  try {
    const dipendente = await Dipendente.findByPk(req.params.id, {
      include: [{ model: Cedolino, limit: 12, order: [['anno', 'DESC'], ['mese', 'DESC']] }]
    });
    if (!dipendente) return res.status(404).json({ error: 'Dipendente non trovato' });
    res.json(dipendente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/anthea/payroll/dipendenti/:id
router.put('/dipendenti/:id', async (req, res) => {
  try {
    const dipendente = await Dipendente.findByPk(req.params.id);
    if (!dipendente) return res.status(404).json({ error: 'Dipendente non trovato' });
    await dipendente.update(req.body);
    res.json({ message: 'Dipendente aggiornato', data: dipendente });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== CEDOLINI ====================

// POST /api/anthea/payroll/cedolini/genera - Genera cedolino per un dipendente
router.post('/cedolini/genera', async (req, res) => {
  try {
    const { dipendenteId, mese, anno } = req.body;
    if (!dipendenteId || !mese || !anno) {
      return res.status(400).json({ error: 'Campi obbligatori: dipendenteId, mese, anno' });
    }
    const cedolino = await generaCedolino(dipendenteId, mese, anno);
    res.status(201).json({ message: 'Cedolino generato', data: cedolino });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/anthea/payroll/cedolini/batch - Genera cedolini per tutti
router.post('/cedolini/batch', async (req, res) => {
  try {
    const { mese, anno } = req.body;
    if (!mese || !anno) {
      return res.status(400).json({ error: 'Campi obbligatori: mese, anno' });
    }
    const risultati = await generaCedoliniBatch(mese, anno);
    res.status(201).json({ message: 'Cedolini batch generati', data: risultati });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/anthea/payroll/cedolini
router.get('/cedolini', async (req, res) => {
  try {
    const { mese, anno } = req.query;
    const where = {};
    if (mese) where.mese = parseInt(mese);
    if (anno) where.anno = parseInt(anno);

    const cedolini = await Cedolino.findAll({
      where,
      include: [{ model: Dipendente, attributes: ['id', 'nome', 'cognome', 'codiceFiscale'] }],
      order: [['anno', 'DESC'], ['mese', 'DESC']]
    });
    res.json({ count: cedolini.length, data: cedolini });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/anthea/payroll/cedolini/:id
router.get('/cedolini/:id', async (req, res) => {
  try {
    const cedolino = await Cedolino.findByPk(req.params.id, {
      include: [
        { model: Dipendente },
        { model: Pagamento },
        { model: F24 }
      ]
    });
    if (!cedolino) return res.status(404).json({ error: 'Cedolino non trovato' });
    res.json(cedolino);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PAGAMENTI ====================

// GET /api/anthea/payroll/pagamenti
router.get('/pagamenti', async (req, res) => {
  try {
    const pagamenti = await Pagamento.findAll({
      include: [{ model: Cedolino, attributes: ['mese', 'anno'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ count: pagamenti.length, data: pagamenti });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/anthea/payroll/pagamenti/:id/processa
router.post('/pagamenti/:id/processa', async (req, res) => {
  try {
    const pagamento = await Pagamento.findByPk(req.params.id);
    if (!pagamento) return res.status(404).json({ error: 'Pagamento non trovato' });
    if (pagamento.stato !== 'in_attesa') {
      return res.status(400).json({ error: 'Pagamento già processato' });
    }

    // Simula bonifico
    await pagamento.update({
      stato: 'processato',
      dataEsecuzione: new Date(),
      riferimentoOperazione: `BON-${Date.now()}-${pagamento.id}`
    });

    res.json({ message: 'Pagamento processato con successo', data: pagamento });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== F24 ====================

// GET /api/anthea/payroll/f24
router.get('/f24', async (req, res) => {
  try {
    const f24List = await F24.findAll({
      include: [{
        model: Cedolino,
        attributes: ['mese', 'anno'],
        include: [{ model: Dipendente, attributes: ['nome', 'cognome'] }]
      }]
    });
    res.json({ count: f24List.length, data: f24List });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== REPORT ====================

// GET /api/anthea/payroll/report/mensile
router.get('/report/mensile', async (req, res) => {
  try {
    const { mese, anno } = req.query;
    if (!mese || !anno) {
      return res.status(400).json({ error: 'Parametri obbligatori: mese, anno' });
    }
    const report = await reportMensile(parseInt(mese), parseInt(anno));
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== HEALTH ====================
router.get('/health', async (req, res) => {
  try {
    const dipendenti = await Dipendente.count();
    const cedolini = await Cedolino.count();
    res.json({
      status: 'ok',
      modulo: 'Anthea Payroll',
      dipendenti,
      cedolini,
      algoritmi: {
        irpef: 'progressiva a scaglioni',
        inps: '9.19% dipendente',
        detrazioni: 'lavoro dipendente + familiari'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inizializza DB
db.sequelize.sync().then(() => {
  console.log('📊 Anthea Payroll Database sincronizzato');
}).catch(err => {
  console.error('❌ Errore sync payroll DB:', err.message);
});

module.exports = router;
