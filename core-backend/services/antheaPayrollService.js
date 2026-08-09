// services/antheaPayrollService.js - Servizio buste paga e calcoli fiscali italiani
const db = require('../models/AntheaPayroll');

const { Dipendente, Cedolino, Pagamento, F24 } = db;

// ============ COSTANTI FISCALI 2024 ============
const ALIQUOTA_INPS = 0.0919;      // 9.19% dipendente
const ALIQUOTA_IRPEF = [
  { max: 15000, rate: 0.23 },
  { max: 28000, rate: 0.25 },
  { max: 50000, rate: 0.35 },
  { max: Infinity, rate: 0.43 }
];
const DETRAZIONE_LAVORO_BASE = 1880; // Detrazione lavoro dipendente base
const DETRAZIONE_INCAP = 0.23;       // 23% soglia incapienza
const ADDIZIONALE_REGIONALE = 0.0123; // 1.23% (media)
const ADDIZIONALE_COMUNALE = 0.008;   // 0.8% (media)

// ============ FUNZIONI DI CALCOLO ============

/**
 * Calcola l'IRPEF lorda progressiva sul reddito annuale
 */
function calcolaIrpef(redditoAnnuale) {
  let irpef = 0;
  let residuo = redditoAnnuale;
  let precedente = 0;

  for (const scaglione of ALIQUOTA_IRPEF) {
    const imponibile = Math.min(residuo, scaglione.max - precedente);
    if (imponibile <= 0) break;
    irpef += imponibile * scaglione.rate;
    residuo -= imponibile;
    precedente = scaglione.max;
  }
  return Math.round(irpef * 100) / 100;
}

/**
 * Calcola detrazioni lavoro dipendente
 */
function calcolaDetrazioniLavoro(redditoAnnuale) {
  if (redditoAnnuale <= 15000) {
    return Math.min(DETRAZIONE_LAVORO_BASE, redditoAnnuale * DETRAZIONE_INCAP);
  } else if (redditoAnnuale <= 28000) {
    const rapporto = (28000 - redditoAnnuale) / (28000 - 15000);
    return Math.max(0, (DETRAZIONE_LAVORO_BASE + (1910 - DETRAZIONE_LAVORO_BASE)) * rapporto);
  } else if (redditoAnnuale <= 50000) {
    const rapporto = (50000 - redditoAnnuale) / (50000 - 28000);
    return Math.max(0, 1910 * rapporto);
  }
  return 0;
}

/**
 * Genera cedolino per un dipendente per mese/anno specifico
 */
async function generaCedolino(dipendenteId, mese, anno) {
  const dipendente = await Dipendente.findByPk(dipendenteId);
  if (!dipendente) throw new Error('Dipendente non trovato');

  const mensilitaLorde = dipendente.ral / 13; // 13 mensilità
  const retribuzioneLorda = Math.round(mensilitaLorde * 100) / 100;

  // Calcoli fiscali annualizzati poi mensilizzati
  const contributiINPS = Math.round(retribuzioneLorda * ALIQUOTA_INPS * 100) / 100;
  const imponibileIrpefAnnuale = dipendente.ral - (dipendente.ral * ALIQUOTA_INPS);
  const irpefAnnuaLorda = calcolaIrpef(imponibileIrpefAnnuale);
  const irpefLordaMensile = Math.round((irpefAnnuaLorda / 13) * 100) / 100;

  const detrazioniAnnue = calcolaDetrazioniLavoro(imponibileIrpefAnnuale);
  const detrazioniMensili = Math.round((detrazioniAnnue / 13) * 100) / 100;

  const irpefNetta = Math.max(0, Math.round((irpefLordaMensile - detrazioniMensili) * 100) / 100);
  const addRegionale = Math.round(retribuzioneLorda * ADDIZIONALE_REGIONALE * 100) / 100;
  const addComunale = Math.round(retribuzioneLorda * ADDIZIONALE_COMUNALE * 100) / 100;
  const nettoInBusta = Math.round((retribuzioneLorda - contributiINPS - irpefNetta - addRegionale - addComunale) * 100) / 100;

  const cedolino = await Cedolino.create({
    dipendenteId,
    mese,
    anno,
    retribuzioneLorda,
    contributiINPS,
    irpefLorda: irpefLordaMensile,
    detrazioniLavoro: detrazioniMensili,
    irpefNetta,
    addizionaleRegionale: addRegionale,
    addizionaleComunale: addComunale,
    nettoInBusta
  });

  // Crea automaticamente il pagamento
  await Pagamento.create({
    dipendenteId,
    cedolinoId: cedolino.id,
    importo: nettoInBusta,
    metodo: 'bonifico',
    stato: 'in_attesa'
  });

  // Crea F24
  const f24Totale = Math.round((contributiINPS + irpefNetta + addRegionale + addComunale) * 100) / 100;
  await F24.create({
    cedolinoId: cedolino.id,
    importoINPS: contributiINPS,
    importoIRPEF: irpefNetta,
    importoTotale: f24Totale,
    dataScadenza: `${anno}-${String(mese + 1 === 13 ? 1 : mese + 1).padStart(2, '0')}-16`
  });

  return cedolino;
}

/**
 * Genera cedolini batch per tutti i dipendenti attivi
 */
async function generaCedoliniBatch(mese, anno) {
  const dipendenti = await Dipendente.findAll({ where: { attivo: true } });
  const risultati = [];

  for (const d of dipendenti) {
    try {
      const cedolino = await generaCedolino(d.id, mese, anno);
      risultati.push({ dipendenteId: d.id, success: true, cedolinoId: cedolino.id });
    } catch (e) {
      risultati.push({ dipendenteId: d.id, success: false, error: e.message });
    }
  }
  return risultati;
}

/**
 * Report mensile payroll
 */
async function reportMensile(mese, anno) {
  const cedolini = await Cedolino.findAll({
    where: { mese, anno },
    include: [{ model: Dipendente }]
  });

  const totaleLordo = cedolini.reduce((sum, c) => sum + c.retribuzioneLorda, 0);
  const totaleNetto = cedolini.reduce((sum, c) => sum + c.nettoInBusta, 0);
  const totaleINPS = cedolini.reduce((sum, c) => sum + c.contributiINPS, 0);
  const totaleIRPEF = cedolini.reduce((sum, c) => sum + c.irpefNetta, 0);

  return {
    mese,
    anno,
    dipendentiElaborati: cedolini.length,
    totaleLordo: Math.round(totaleLordo * 100) / 100,
    totaleNetto: Math.round(totaleNetto * 100) / 100,
    totaleContributi: Math.round((totaleINPS + totaleIRPEF) * 100) / 100,
    dettaglio: cedolini.map(c => ({
      dipendente: `${c.Dipendente.nome} ${c.Dipendente.cognome}`,
      lordo: c.retribuzioneLorda,
      netto: c.nettoInBusta,
      inps: c.contributiINPS,
      irpef: c.irpefNetta
    }))
  };
}

// Export
module.exports = {
  Dipendente,
  Cedolino,
  Pagamento,
  F24,
  generaCedolino,
  generaCedoliniBatch,
  calcolaIrpef,
  calcolaDetrazioniLavoro,
  reportMensile,
  db
};
