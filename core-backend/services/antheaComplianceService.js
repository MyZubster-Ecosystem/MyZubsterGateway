// services/antheaComplianceService.js - Servizio Compliance GDPR e Sicurezza
const db = require('../models/AntheaCompliance');

const {
  Documento, Consenso, DataBreach, IncidentReport,
  RiskAssessment, AuditTrail
} = db;

// ============ DOCUMENTI ============

/** Verifica documenti in scadenza e aggiorna stato */
async function checkScadenze() {
  const oggi = new Date();
  const fra30gg = new Date(oggi.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fra7gg = new Date(oggi.getTime() + 7 * 24 * 60 * 60 * 1000);

  const documenti = await Documento.findAll({ where: { stato: ['valido', 'in_scadenza'] } });

  const notifiche = [];

  for (const doc of documenti) {
    const scadenza = new Date(doc.dataScadenza);
    if (scadenza < oggi) {
      await doc.update({ stato: 'scaduto' });
      notifiche.push({ documentoId: doc.id, nome: doc.nome, stato: 'scaduto', gravita: 'alta' });
    } else if (scadenza <= fra7gg && !doc.notifica7gg) {
      await doc.update({ notifica7gg: true });
      notifiche.push({ documentoId: doc.id, nome: doc.nome, giorniRimanenti: Math.ceil((scadenza - oggi) / 86400000), gravita: 'critica' });
    } else if (scadenza <= fra30gg && !doc.notifica30gg) {
      await doc.update({ notifica30gg: true });
      notifiche.push({ documentoId: doc.id, nome: doc.nome, giorniRimanenti: Math.ceil((scadenza - oggi) / 86400000), gravita: 'media' });
    }
  }

  return notifiche;
}

// ============ GDPR CONSENSI ============

/** Registra un nuovo consenso */
async function registraConsenso({ soggettoId, tipoSoggetto, tipoConsenso, acconsentito, ipAddress }) {
  // Revoca eventuali consensi precedenti per lo stesso tipo
  await Consenso.update(
    { acconsentito: false, dataRevoca: new Date() },
    { where: { soggettoId, tipoConsenso, acconsentito: true } }
  );

  return Consenso.create({
    soggettoId,
    tipoSoggetto,
    tipoConsenso,
    acconsentito,
    ipAddress,
    dataConsenso: new Date()
  });
}

/** Verifica se un soggetto ha dato il consenso */
async function verificaConsenso(soggettoId, tipoConsenso) {
  const consenso = await Consenso.findOne({
    where: { soggettoId, tipoConsenso, acconsentito: true },
    order: [['dataConsenso', 'DESC']]
  });
  return !!consenso;
}

// ============ DATA BREACH ============

/** Registra un data breach e valuta se notificare il Garante */
async function registraDataBreach(data) {
  const breach = await DataBreach.create(data);

  // Se gravità alta o critica, segnala necessità notifica Garante entro 72h
  if (['alta', 'critica'].includes(data.gravita)) {
    const scadenzaNotifica = new Date(breach.dataRilevazione.getTime() + 72 * 60 * 60 * 1000);
    await breach.update({ dataNotificaGarante: scadenzaNotifica });
  }

  await registraAudit('DataBreach', breach.id, 'creato', null, `Breach ${data.gravita}: ${data.descrizione.substring(0, 100)}`);
  return breach;
}

// ============ RISK ASSESSMENT ============

/** Calcola il livello di rischio (P x I) */
function calcolaLivelloRischio(probabilita, impatto) {
  return probabilita * impatto;
}

/** Crea un nuovo risk assessment con calcolo automatico */
async function creaRiskAssessment(data) {
  const livello = calcolaLivelloRischio(data.probabilita, data.impatto);
  return RiskAssessment.create({ ...data, livelloRischio: livello });
}

// ============ AUDIT TRAIL ============

async function registraAudit(entita, entitaId, azione, datiPrecedenti, datiNuovi, utente = 'sistema') {
  return AuditTrail.create({
    entita,
    entitaId,
    azione,
    utente,
    datiPrecedenti: datiPrecedenti ? JSON.stringify(datiPrecedenti) : null,
    datiNuovi: datiNuovi ? JSON.stringify(datiNuovi) : null,
    ipAddress: '127.0.0.1'
  });
}

// ============ REPORT ============

async function reportCompliance() {
  const [docValidi, docScaduti, docInScadenza] = await Promise.all([
    Documento.count({ where: { stato: 'valido' } }),
    Documento.count({ where: { stato: 'scaduto' } }),
    Documento.count({ where: { stato: 'in_scadenza' } })
  ]);

  const [breachAperti, breachRisolti] = await Promise.all([
    DataBreach.count({ where: { stato: ['aperto', 'in_gestione'] } }),
    DataBreach.count({ where: { stato: 'risolto' } })
  ]);

  const [incidentiAperti, rischiAttivi] = await Promise.all([
    IncidentReport.count({ where: { stato: ['aperto', 'indagine'] } }),
    RiskAssessment.count({ where: { stato: 'attivo' } })
  ]);

  return {
    documenti: { validi: docValidi, inScadenza: docInScadenza, scaduti: docScaduti },
    dataBreach: { aperti: breachAperti, risolti: breachRisolti },
    sicurezza: { incidentiAperti, rischiAttivi },
    auditTrail: await AuditTrail.count(),
    compliant: docScaduti === 0 && breachAperti === 0
  };
}

module.exports = {
  Documento, Consenso, DataBreach, IncidentReport, RiskAssessment, AuditTrail,
  checkScadenze, registraConsenso, verificaConsenso,
  registraDataBreach, creaRiskAssessment, calcolaLivelloRischio,
  registraAudit, reportCompliance, db
};
