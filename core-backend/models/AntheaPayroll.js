// models/AntheaPayroll.js - Modelli per il Sistema Payroll Anthea
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './anthea_payroll.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Modello Dipendente
const Dipendente = sequelize.define('Dipendente', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  cognome: { type: DataTypes.STRING, allowNull: false },
  codiceFiscale: { type: DataTypes.STRING(16), allowNull: false, unique: true },
  dataNascita: { type: DataTypes.DATEONLY, allowNull: false },
  dataAssunzione: { type: DataTypes.DATEONLY, allowNull: false },
  tipoContratto: { type: DataTypes.ENUM('indeterminato', 'determinato', 'apprendistato', 'stage'), defaultValue: 'indeterminato' },
  livello: { type: DataTypes.STRING(10), defaultValue: '3' },
  ral: { type: DataTypes.FLOAT, allowNull: false, comment: 'RAL annuale in EUR' },
  oreSettimanali: { type: DataTypes.INTEGER, defaultValue: 40 },
  email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  iban: { type: DataTypes.STRING(27), allowNull: false },
  attivo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'dipendenti', timestamps: true });

// Modello Busta Paga (Cedolino)
const Cedolino = sequelize.define('Cedolino', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dipendenteId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Dipendente, key: 'id' } },
  mese: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 12 } },
  anno: { type: DataTypes.INTEGER, allowNull: false },
  retribuzioneLorda: { type: DataTypes.FLOAT, allowNull: false },
  contributiINPS: { type: DataTypes.FLOAT, defaultValue: 0 },
  irpefLorda: { type: DataTypes.FLOAT, defaultValue: 0 },
  detrazioniLavoro: { type: DataTypes.FLOAT, defaultValue: 0 },
  irpefNetta: { type: DataTypes.FLOAT, defaultValue: 0 },
  addizionaleRegionale: { type: DataTypes.FLOAT, defaultValue: 0 },
  addizionaleComunale: { type: DataTypes.FLOAT, defaultValue: 0 },
  nettoInBusta: { type: DataTypes.FLOAT, allowNull: false },
  inviata: { type: DataTypes.BOOLEAN, defaultValue: false },
  dataInvio: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'cedolini', timestamps: true });

// Modello Pagamento
const Pagamento = sequelize.define('Pagamento', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dipendenteId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Dipendente, key: 'id' } },
  cedolinoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Cedolino, key: 'id' } },
  importo: { type: DataTypes.FLOAT, allowNull: false },
  metodo: { type: DataTypes.ENUM('bonifico', 'assegno', 'contanti'), defaultValue: 'bonifico' },
  stato: { type: DataTypes.ENUM('in_attesa', 'processato', 'fallito'), defaultValue: 'in_attesa' },
  dataEsecuzione: { type: DataTypes.DATE, allowNull: true },
  riferimentoOperazione: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'pagamenti', timestamps: true });

// Modello F24
const F24 = sequelize.define('F24', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cedolinoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Cedolino, key: 'id' } },
  importoINPS: { type: DataTypes.FLOAT, defaultValue: 0 },
  importoIRPEF: { type: DataTypes.FLOAT, defaultValue: 0 },
  importoTotale: { type: DataTypes.FLOAT, allowNull: false },
  dataScadenza: { type: DataTypes.DATEONLY, allowNull: false },
  stato: { type: DataTypes.ENUM('da_pagare', 'pagato'), defaultValue: 'da_pagare' }
}, { tableName: 'f24', timestamps: true });

// Relazioni
Dipendente.hasMany(Cedolino, { foreignKey: 'dipendenteId' });
Cedolino.belongsTo(Dipendente, { foreignKey: 'dipendenteId' });
Cedolino.hasOne(Pagamento, { foreignKey: 'cedolinoId' });
Cedolino.hasOne(F24, { foreignKey: 'cedolinoId' });

// Database
const db = {
  sequelize,
  Sequelize,
  Dipendente,
  Cedolino,
  Pagamento,
  F24
};

module.exports = db;
