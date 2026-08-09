// models/AntheaCompliance.js - Modelli per Sistema Compliance Anthea
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './anthea_compliance.sqlite',
  logging: false,
});

// Documento Obbligatorio
const Documento = sequelize.define('Documento', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.ENUM('dvr', 'nomina_rspp', 'nomina_medico', 'formazione', 'privacy', 'consenso', 'audit', 'altro'), allowNull: false },
  descrizione: { type: DataTypes.TEXT },
  dataEmissione: { type: DataTypes.DATEONLY },
  dataScadenza: { type: DataTypes.DATEONLY, allowNull: false },
  stato: { type: DataTypes.ENUM('valido', 'in_scadenza', 'scaduto', 'archiviato'), defaultValue: 'valido' },
  filePath: { type: DataTypes.STRING },
  notifica30gg: { type: DataTypes.BOOLEAN, defaultValue: false },
  notifica7gg: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'documenti', timestamps: true });

// GDPR - Consensi
const Consenso = sequelize.define('Consenso', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  soggettoId: { type: DataTypes.INTEGER, allowNull: false },
  tipoSoggetto: { type: DataTypes.ENUM('dipendente', 'cliente', 'fornitore'), defaultValue: 'dipendente' },
  tipoConsenso: { type: DataTypes.ENUM('marketing', 'privacy', 'dati_sensibili', 'profilazione', 'cookie'), allowNull: false },
  acconsentito: { type: DataTypes.BOOLEAN, defaultValue: false },
  dataConsenso: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  dataRevoca: { type: DataTypes.DATE, allowNull: true },
  ipAddress: { type: DataTypes.STRING(45) }
}, { tableName: 'consensi', timestamps: true });

// Data Breach
const DataBreach = sequelize.define('DataBreach', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dataRilevazione: { type: DataTypes.DATE, allowNull: false },
  descrizione: { type: DataTypes.TEXT, allowNull: false },
  tipoDati: { type: DataTypes.ENUM('personali', 'sensibili', 'giudiziari', 'finanziari', 'altro'), allowNull: false },
  numeroInteressati: { type: DataTypes.INTEGER, defaultValue: 0 },
  gravita: { type: DataTypes.ENUM('bassa', 'media', 'alta', 'critica'), defaultValue: 'media' },
  notificatoGarante: { type: DataTypes.BOOLEAN, defaultValue: false },
  dataNotificaGarante: { type: DataTypes.DATE, allowNull: true },
  notificatoInteressati: { type: DataTypes.BOOLEAN, defaultValue: false },
  azioniIntraprese: { type: DataTypes.TEXT },
  stato: { type: DataTypes.ENUM('aperto', 'in_gestione', 'risolto'), defaultValue: 'aperto' }
}, { tableName: 'data_breaches', timestamps: true });

// Incident Reporting Sicurezza
const IncidentReport = sequelize.define('IncidentReport', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tipo: { type: DataTypes.ENUM('near_miss', 'incidente', 'malattia', 'infortunio', 'mancato_infortunio'), allowNull: false },
  dataIncidente: { type: DataTypes.DATE, allowNull: false },
  luogo: { type: DataTypes.STRING },
  descrizione: { type: DataTypes.TEXT, allowNull: false },
  coinvolti: { type: DataTypes.INTEGER, defaultValue: 1 },
  giorniPrognosi: { type: DataTypes.INTEGER, defaultValue: 0 },
  causaRadice: { type: DataTypes.TEXT },
  azioniCorrettive: { type: DataTypes.TEXT },
  stato: { type: DataTypes.ENUM('aperto', 'indagine', 'chiuso'), defaultValue: 'aperto' },
  gravita: { type: DataTypes.ENUM('lieve', 'moderata', 'grave', 'mortale'), defaultValue: 'lieve' }
}, { tableName: 'incident_reports', timestamps: true });

// Risk Assessment
const RiskAssessment = sequelize.define('RiskAssessment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  area: { type: DataTypes.STRING, allowNull: false },
  rischio: { type: DataTypes.TEXT, allowNull: false },
  probabilita: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 }, defaultValue: 3 },
  impatto: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 }, defaultValue: 3 },
  livelloRischio: { type: DataTypes.INTEGER },
  misurePrevenzione: { type: DataTypes.TEXT },
  dataValutazione: { type: DataTypes.DATEONLY, allowNull: false },
  prossimaRevisione: { type: DataTypes.DATEONLY },
  stato: { type: DataTypes.ENUM('attivo', 'mitigato', 'accettato', 'chiuso'), defaultValue: 'attivo' }
}, { tableName: 'risk_assessments', timestamps: true });

// Audit Trail
const AuditTrail = sequelize.define('AuditTrail', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  entita: { type: DataTypes.STRING, allowNull: false },
  entitaId: { type: DataTypes.INTEGER },
  azione: { type: DataTypes.ENUM('creato', 'modificato', 'eliminato', 'visualizzato', 'esportato'), allowNull: false },
  utente: { type: DataTypes.STRING },
  datiPrecedenti: { type: DataTypes.TEXT },
  datiNuovi: { type: DataTypes.TEXT },
  ipAddress: { type: DataTypes.STRING(45) }
}, { tableName: 'audit_trail', timestamps: true });

// Relazioni
Documento.hasMany(AuditTrail, { foreignKey: 'entitaId', constraints: false, scope: { entita: 'documento' } });

const db = {
  sequelize,
  Sequelize,
  Documento,
  Consenso,
  DataBreach,
  IncidentReport,
  RiskAssessment,
  AuditTrail,
  Documento,
  Consenso
};

module.exports = db;
