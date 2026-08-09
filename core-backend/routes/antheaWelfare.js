// routes/antheaWelfare.js - Rotte API per Sistema Welfare Anthea
const express = require('express');
const router = express.Router();
const {
  CategoriaBenefit, Benefit, IscrizioneBenefit, FondoPensione, UtilizzoBenefit,
  initBenefitStandard, iscriviBenefit, benefitDipendente,
  attivaFondoPensione, versaFondoPensione, richiediUtilizzo,
  approvaUtilizzo, reportWelfare, db
} = require('../services/antheaWelfareService');

// ==================== INIZIALIZZAZIONE ====================
router.post('/init', async (req, res) => {
  try {
    const result = await initBenefitStandard();
    res.json({ message: 'Benefit standard inizializzati', ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== CATEGORIE ====================
router.get('/categorie', async (req, res) => {
  try {
    const categorie = await CategoriaBenefit.findAll({ include: [Benefit] });
    res.json({ count: categorie.length, data: categorie });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== BENEFIT ====================
router.get('/benefit', async (req, res) => {
  try {
    const { attivo } = req.query;
    const where = attivo !== undefined ? { attivo: attivo === 'true' } : {};
    const benefits = await Benefit.findAll({ where, include: [CategoriaBenefit] });
    res.json({ count: benefits.length, data: benefits });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/benefit/:id', async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id, { include: [CategoriaBenefit] });
    if (!benefit) return res.status(404).json({ error: 'Benefit non trovato' });
    res.json(benefit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== ISCRIZIONI ====================
router.get('/iscrizioni', async (req, res) => {
  try {
    const iscrizioni = await IscrizioneBenefit.findAll({
      include: [{ model: Benefit, include: [CategoriaBenefit] }],
      order: [['dataIscrizione', 'DESC']]
    });
    res.json({ count: iscrizioni.length, data: iscrizioni });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/iscrizioni', async (req, res) => {
  try {
    const { dipendenteId, benefitId, dataScadenza } = req.body;
    if (!dipendenteId || !benefitId) {
      return res.status(400).json({ error: 'Campi obbligatori: dipendenteId, benefitId' });
    }
    const iscrizione = await iscriviBenefit(dipendenteId, benefitId, dataScadenza);
    res.status(201).json({ message: 'Iscrizione creata', data: iscrizione });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/iscrizioni/dipendente/:dipendenteId', async (req, res) => {
  try {
    const benefits = await benefitDipendente(parseInt(req.params.dipendenteId));
    res.json({ dipendenteId: req.params.dipendenteId, count: benefits.length, data: benefits });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/iscrizioni/:id', async (req, res) => {
  try {
    const iscrizione = await IscrizioneBenefit.findByPk(req.params.id);
    if (!iscrizione) return res.status(404).json({ error: 'Iscrizione non trovata' });
    await iscrizione.update(req.body);
    res.json({ message: 'Iscrizione aggiornata', data: iscrizione });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ==================== FONDO PENSIONE ====================
router.get('/fondi-pensione', async (req, res) => {
  try {
    const fondi = await FondoPensione.findAll({ order: [['dataAdesione', 'DESC']] });
    res.json({ count: fondi.length, data: fondi });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/fondi-pensione', async (req, res) => {
  try {
    const { dipendenteId, nomeFondo, quotaDipendente, quotaAzienda } = req.body;
    if (!dipendenteId || !nomeFondo) {
      return res.status(400).json({ error: 'Campi obbligatori: dipendenteId, nomeFondo' });
    }
    const fondo = await attivaFondoPensione(dipendenteId, nomeFondo, quotaDipendente || 0, quotaAzienda || 0);
    res.status(201).json({ message: 'Fondo pensione attivato', data: fondo });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/fondi-pensione/:id/versamento', async (req, res) => {
  try {
    const { importo } = req.body;
    if (!importo || importo <= 0) {
      return res.status(400).json({ error: 'Importo non valido' });
    }
    const fondo = await versaFondoPensione(req.params.id, importo);
    res.json({ message: 'Versamento effettuato', data: fondo });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ==================== UTILIZZO BENEFIT ====================
router.get('/utilizzi', async (req, res) => {
  try {
    const utilizzi = await UtilizzoBenefit.findAll({
      include: [{ model: IscrizioneBenefit, include: [Benefit] }],
      order: [['dataUtilizzo', 'DESC']]
    });
    res.json({ count: utilizzi.length, data: utilizzi });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/utilizzi', async (req, res) => {
  try {
    const { iscrizioneId, descrizione, importo } = req.body;
    if (!iscrizioneId || !descrizione) {
      return res.status(400).json({ error: 'Campi obbligatori: iscrizioneId, descrizione' });
    }
    const utilizzo = await richiediUtilizzo(iscrizioneId, { descrizione, importo: importo || 0 });
    res.status(201).json({ message: 'Richiesta utilizzo creata', data: utilizzo });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/utilizzi/:id/approva', async (req, res) => {
  try {
    const utilizzo = await approvaUtilizzo(req.params.id);
    res.json({ message: 'Utilizzo approvato', data: utilizzo });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ==================== REPORT ====================
router.get('/report', async (req, res) => {
  try {
    const report = await reportWelfare();
    res.json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== HEALTH ====================
router.get('/health', async (req, res) => {
  try {
    const counts = await Promise.all([
      CategoriaBenefit.count(), Benefit.count({ where: { attivo: true } }),
      IscrizioneBenefit.count({ where: { stato: 'attivo' } }),
      FondoPensione.count({ where: { stato: 'attivo' } }),
      UtilizzoBenefit.count()
    ]);
    res.json({
      status: 'ok',
      modulo: 'Anthea Welfare',
      categorie: counts[0], benefitAttivi: counts[1],
      iscrizioniAttive: counts[2], fondiPensioni: counts[3],
      utilizziTotali: counts[4]
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

db.sequelize.sync().then(() => {
  console.log('💝 Anthea Welfare Database sincronizzato');
}).catch(err => {
  console.error('❌ Errore sync welfare DB:', err.message);
});

module.exports = router;
