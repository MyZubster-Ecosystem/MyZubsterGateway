// services/antheaWelfareService.js - Servizio Welfare Aziendale
const db = require('../models/AntheaWelfare');

const {
  CategoriaBenefit, Benefit, IscrizioneBenefit,
  FondoPensione, UtilizzoBenefit
} = db;

// ============ BENEFIT ============

/** Inizializza categorie benefit standard */
async function initBenefitStandard() {
  const categorie = [
    { nome: 'Assicurazione Sanitaria', tipo: 'sanitario', descrizione: 'Copertura spese mediche e ricoveri' },
    { nome: 'Buoni Pasto', tipo: 'ristorazione', descrizione: 'Ticket restaurant e buoni pasto elettronici' },
    { nome: 'Auto Aziendale', tipo: 'trasporto', descrizione: 'Auto ad uso promiscuo' },
    { nome: 'Telefono Aziendale', tipo: 'flessibile', descrizione: 'Smartphone e piano dati' },
    { nome: 'Formazione', tipo: 'formazione', descrizione: 'Corsi, certificazioni e master' },
    { nome: 'Fondo Pensione', tipo: 'previdenza', descrizione: 'Previdenza complementare' },
    { nome: 'Welfare Flessibile', tipo: 'flessibile', descrizione: 'Crediti welfare spendibili' }
  ];

  for (const cat of categorie) {
    await CategoriaBenefit.findOrCreate({ where: { nome: cat.nome }, defaults: cat });
  }

  const benefits = [
    { nome: 'Assicurazione Sanitaria Base', categoriaId: 1, costoAnnuale: 1200, tipoValore: 'servizio' },
    { nome: 'Assicurazione Sanitaria Premium', categoriaId: 1, costoAnnuale: 2500, tipoValore: 'servizio' },
    { nome: 'Buono Pasto 7€', categoriaId: 2, costoAnnuale: 1540, tipoValore: 'monetario' },
    { nome: 'Buono Pasto 8€', categoriaId: 2, costoAnnuale: 1760, tipoValore: 'monetario' },
    { nome: 'Auto Aziendale Segmento B', categoriaId: 3, costoAnnuale: 4800, tipoValore: 'servizio' },
    { nome: 'Auto Aziendale Segmento C', categoriaId: 3, costoAnnuale: 7200, tipoValore: 'servizio' },
    { nome: 'Smartphone + SIM', categoriaId: 4, costoAnnuale: 600, tipoValore: 'servizio' },
    { nome: 'Budget Formazione 1000€', categoriaId: 5, costoAnnuale: 1000, tipoValore: 'rimborso' },
    { nome: 'Budget Formazione 3000€', categoriaId: 5, costoAnnuale: 3000, tipoValore: 'rimborso' },
    { nome: 'Fondo Pensione - Contributo Aziendale 2%', categoriaId: 6, costoAnnuale: 0, tipoValore: 'monetario' },
    { nome: 'Credito Welfare 500€', categoriaId: 7, costoAnnuale: 500, tipoValore: 'monetario' },
    { nome: 'Credito Welfare 1000€', categoriaId: 7, costoAnnuale: 1000, tipoValore: 'monetario' }
  ];

  for (const b of benefits) {
    await Benefit.findOrCreate({ where: { nome: b.nome }, defaults: b });
  }

  return { categorie: await CategoriaBenefit.count(), benefits: await Benefit.count() };
}

/** Iscrivi dipendente a un benefit */
async function iscriviBenefit(dipendenteId, benefitId, dataScadenza = null) {
  const benefit = await Benefit.findByPk(benefitId);
  if (!benefit) throw new Error('Benefit non trovato');

  // Verifica se già iscritto e attivo
  const esistente = await IscrizioneBenefit.findOne({
    where: { dipendenteId, benefitId, stato: 'attivo' }
  });
  if (esistente) throw new Error('Dipendente già iscritto a questo benefit');

  return IscrizioneBenefit.create({
    dipendenteId,
    benefitId,
    quotaAnnuale: benefit.costoAnnuale,
    dataScadenza: dataScadenza || new Date(new Date().getFullYear() + 1, 11, 31),
    stato: 'attivo'
  });
}

/** Ottieni tutti i benefit attivi di un dipendente */
async function benefitDipendente(dipendenteId) {
  return IscrizioneBenefit.findAll({
    where: { dipendenteId, stato: 'attivo' },
    include: [{ model: Benefit, include: [CategoriaBenefit] }]
  });
}

// ============ FONDO PENSIONE ============

/** Attiva fondo pensione per dipendente */
async function attivaFondoPensione(dipendenteId, nomeFondo, quotaDipendente, quotaAzienda) {
  return FondoPensione.create({
    dipendenteId,
    nomeFondo,
    dataAdesione: new Date(),
    quotaDipendente,
    quotaAzienda,
    percentualeTFR: 100,
    montanteAccumulato: 0,
    stato: 'attivo'
  });
}

/** Versamento mensile fondo pensione */
async function versaFondoPensione(fondoId, importo) {
  const fondo = await FondoPensione.findByPk(fondoId);
  if (!fondo || fondo.stato !== 'attivo') throw new Error('Fondo pensione non attivo');

  await fondo.update({
    montanteAccumulato: fondo.montanteAccumulato + importo
  });

  return fondo;
}

// ============ UTILIZZO BENEFIT ============

/** Richiedi utilizzo benefit (rimborso/servizio) */
async function richiediUtilizzo(iscrizioneId, { descrizione, importo = 0 }) {
  const iscrizione = await IscrizioneBenefit.findByPk(iscrizioneId);
  if (!iscrizione || iscrizione.stato !== 'attivo') throw new Error('Iscrizione non attiva');

  return UtilizzoBenefit.create({
    iscrizioneId,
    descrizione,
    importo,
    dataUtilizzo: new Date(),
    stato: 'richiesto'
  });
}

/** Approva utilizzo benefit */
async function approvaUtilizzo(utilizzoId) {
  const utilizzo = await UtilizzoBenefit.findByPk(utilizzoId);
  if (!utilizzo) throw new Error('Utilizzo non trovato');
  return utilizzo.update({ stato: 'approvato' });
}

// ============ REPORT ============

async function reportWelfare() {
  const [iscrizioniAttive, fondiAttivi, utilizziTotali] = await Promise.all([
    IscrizioneBenefit.count({ where: { stato: 'attivo' } }),
    FondoPensione.count({ where: { stato: 'attivo' } }),
    UtilizzoBenefit.count()
  ]);

  const costoTotale = await IscrizioneBenefit.sum('quotaAnnuale', { where: { stato: 'attivo' } }) || 0;
  const montantePensioni = await FondoPensione.sum('montanteAccumulato', { where: { stato: 'attivo' } }) || 0;

  const utilizziApprovati = await UtilizzoBenefit.findAll({
    where: { stato: ['approvato', 'erogato'] }
  });
  const erogatoTotale = utilizziApprovati.reduce((sum, u) => sum + (u.importo || 0), 0);

  return {
    iscrizioniAttive,
    fondiPensioniAttivi: fondiAttivi,
    costoTotaleAnnuale: costoTotale,
    montantePensioni,
    utilizziTotali,
    erogatoTotale
  };
}

module.exports = {
  CategoriaBenefit, Benefit, IscrizioneBenefit, FondoPensione, UtilizzoBenefit,
  initBenefitStandard, iscriviBenefit, benefitDipendente,
  attivaFondoPensione, versaFondoPensione,
  richiediUtilizzo, approvaUtilizzo,
  reportWelfare, db
};
