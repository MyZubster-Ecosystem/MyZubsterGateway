// routes/antheaCompliance.js - Rotte API per Sistema Compliance Anthea
const express = require('express');
const router = express.Router();
const {
  Documento, Consenso, DataBreach, IncidentReport, RiskAssessment, AuditTrail,
  checkScadenze, registraConsenso, verificaConsenso, registraDataBreach,
  creaRiskAssessment, registraAudit, reportCompliance, db
} = require('../services/antheaComplianceService');

// ==================== DOCUMENTI ====================
router.get('/documenti', async (req, res) => {
  try {
    const { stato } = req.query;
    const where = stato ? { stato } : {};
    const docs = await Documento.findAll({ where, order: [['dataScadenza', 'ASC']] });
    res.json({ count: docs.length, data: docs });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/documenti', async (req, res) => {
  try {
    const doc = await Documento.create(req.body);
    await registraAudit('Documento', doc.id, 'creato', null, { nome: doc.nome });
    res.status(201).json({ message: 'Documento creato', data: doc });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/documenti/:id', async (req, res) => {
  try {
    const doc = await Documento.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento non trovato' });
    const precedente = doc.toJSON();
    await doc.update(req.body);
    await registraAudit('Documento', doc.id, 'modificato', precedente, doc.toJSON());
    res.json({ message: 'Documento aggiornato', data: doc });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/documenti/check-scadenze', async (req, res) => {
  try {
    const notifiche = await checkScadenze();
    res.json({ message: 'Controllo scadenze completato', notifiche });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== GDPR - CONSENSI ====================
router.get('/consensi', async (req, res) => {
  try {
    const consensi = await Consenso.findAll({ order: [['dataConsenso', 'DESC']], limit: 100 });
    res.json({ count: consensi.length, data: consensi });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/consensi', async (req, res) => {
  try {
    const consenso = await registraConsenso(req.body);
    res.status(201).json({ message: 'Consenso registrato', data: consenso });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/consensi/verifica/:soggettoId/:tipoConsenso', async (req, res) => {
  try {
    const haConsenso = await verificaConsenso(parseInt(req.params.soggettoId), req.params.tipoConsenso);
    res.json({ soggettoId: req.params.soggettoId, tipoConsenso: req.params.tipoConsenso, acconsentito: haConsenso });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== DATA BREACH ====================
router.get('/data-breaches', async (req, res) => {
  try {
    const breaches = await DataBreach.findAll({ order: [['dataRilevazione', 'DESC']] });
    res.json({ count: breaches.length, data: breaches });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/data-breaches', async (req, res) => {
  try {
    const breach = await registraDataBreach(req.body);
    res.status(201).json({ message: 'Data breach registrato', data: breach });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ==================== INCIDENT REPORTING ====================
router.get('/incidenti', async (req, res) => {
  try {
    const incidenti = await IncidentReport.findAll({ order: [['dataIncidente', 'DESC']] });
    res.json({ count: incidenti.length, data: incidenti });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/incidenti', async (req, res) => {
  try {
    const incidente = await IncidentReport.create(req.body);
    await registraAudit('IncidentReport', incidente.id, 'creato', null, { tipo: incidente.tipo });
    res.status(201).json({ message: 'Incidente registrato', data: incidente });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ==================== RISK ASSESSMENT ====================
router.get('/rischi', async (req, res) => {
  try {
    const rischi = await RiskAssessment.findAll({ order: [['livelloRischio', 'DESC']] });
    res.json({ count: rischi.length, data: rischi });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/rischi', async (req, res) => {
  try {
    const rischio = await creaRiskAssessment(req.body);
    res.status(201).json({
      message: 'Risk assessment creato',
      data: rischio,
      livelloRischio: rischio.livelloRischio,
      classificazione: rischio.livelloRischio <= 9 ? 'basso' : rischio.livelloRischio <= 16 ? 'medio' : 'alto'
    });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ==================== AUDIT TRAIL ====================
router.get('/audit', async (req, res) => {
  try {
    const audit = await AuditTrail.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
    res.json({ count: audit.length, data: audit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== REPORT ====================
router.get('/report', async (req, res) => {
  try {
    const report = await reportCompliance();
    res.json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== HEALTH ====================
router.get('/health', async (req, res) => {
  try {
    const counts = await Promise.all([
      Documento.count(), Consenso.count(), DataBreach.count(),
      IncidentReport.count(), RiskAssessment.count(), AuditTrail.count()
    ]);
    res.json({
      status: 'ok',
      modulo: 'Anthea Compliance',
      documenti: counts[0], consensi: counts[1], dataBreaches: counts[2],
      incidenti: counts[3], rischi: counts[4], auditTrail: counts[5]
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

db.sequelize.sync().then(() => {
  console.log('📋 Anthea Compliance Database sincronizzato');
}).catch(err => {
  console.error('❌ Errore sync compliance DB:', err.message);
});

module.exports = router;
