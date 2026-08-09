// models/AntheaWelfare.js - Modelli per Sistema Welfare Anthea
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './anthea_welfare.sqlite',
  logging: false,
});

// Categoria Benefit
const CategoriaBenefit = sequelize.define('CategoriaBenefit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descrizione: { type: DataTypes.TEXT },
  tipo: { type: DataTypes.ENUM('sanitario', 'previdenza', 'flessibile', 'formazione', 'trasporto', 'ristorazione', 'altro'), allowNull: false }
}, { tableName: 'categorie_benefit', timestamps: true });

// Benefit disponibile
const Benefit = sequelize.define('Benefit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descrizione: { type: DataTypes.TEXT },
  categoriaId: { type: DataTypes.INTEGER, references: { model: CategoriaBenefit, key: 'id' } },
  costoAnnuale: { type: DataTypes.FLOAT, defaultValue: 0 },
  tipoValore: { type: DataTypes.ENUM('monetario', 'servizio', 'rimborso'), defaultValue: 'servizio' },
  attivo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'benefit', timestamps: true });

// Iscrizione dipendente a benefit
const IscrizioneBenefit = sequelize.define('IscrizioneBenefit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dipendenteId: { type: DataTypes.INTEGER, allowNull: false },
  benefitId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Benefit, key: 'id' } },
  dataIscrizione: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  dataScadenza: { type: DataTypes.DATEONLY },
  quotaAnnuale: { type: DataTypes.FLOAT, defaultValue: 0 },
  stato: { type: DataTypes.ENUM('attivo', 'sospeso', 'scaduto', 'cancellato'), defaultValue: 'attivo' }
}, { tableName: 'iscrizioni_benefit', timestamps: true });

// Fondo Pensione
const FondoPensione = sequelize.define('FondoPensione', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dipendenteId: { type: DataTypes.INTEGER, allowNull: false },
  nomeFondo: { type: DataTypes.STRING, allowNull: false },
  dataAdesione: { type: DataTypes.DATEONLY, allowNull: false },
  quotaDipendente: { type: DataTypes.FLOAT, defaultValue: 0 },
  quotaAzienda: { type: DataTypes.FLOAT, defaultValue: 0 },
  percentualeTFR: { type: DataTypes.INTEGER, defaultValue: 100 },
  montanteAccumulato: { type: DataTypes.FLOAT, defaultValue: 0 },
  stato: { type: DataTypes.ENUM('attivo', 'sospeso', 'liquidato'), defaultValue: 'attivo' }
}, { tableName: 'fondi_pensione', timestamps: true });

// Utilizzo benefit (tracking)
const UtilizzoBenefit = sequelize.define('UtilizzoBenefit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  iscrizioneId: { type: DataTypes.INTEGER, allowNull: false, references: { model: IscrizioneBenefit, key: 'id' } },
  dataUtilizzo: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  descrizione: { type: DataTypes.TEXT },
  importo: { type: DataTypes.FLOAT, defaultValue: 0 },
  stato: { type: DataTypes.ENUM('richiesto', 'approvato', 'erogato', 'respinto'), defaultValue: 'richiesto' }
}, { tableName: 'utilizzi_benefit', timestamps: true });

// Relazioni
CategoriaBenefit.hasMany(Benefit, { foreignKey: 'categoriaId' });
Benefit.belongsTo(CategoriaBenefit, { foreignKey: 'categoriaId' });
Benefit.hasMany(IscrizioneBenefit, { foreignKey: 'benefitId' });
IscrizioneBenefit.belongsTo(Benefit, { foreignKey: 'benefitId' });
IscrizioneBenefit.hasMany(UtilizzoBenefit, { foreignKey: 'iscrizioneId' });

const db = {
  sequelize, Sequelize,
  CategoriaBenefit, Benefit, IscrizioneBenefit,
  FondoPensione, UtilizzoBenefit
};

module.exports = db;
