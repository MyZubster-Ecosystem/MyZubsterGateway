const mongoose = require('mongoose');

const DataImportAuditSchema = new mongoose.Schema(
  {
    importBatchId: { type: String, required: true, unique: true, index: true },
    digest: { type: String, required: true },
    datasetType: { type: String, required: true, trim: true, maxlength: 120 },
    source: { type: String, required: true, trim: true, maxlength: 240 },
    format: { type: String, enum: ['csv', 'json'], required: true },
    rowCount: { type: Number, required: true, min: 1 },
    schemaFields: [{ type: String }],
    warnings: [{ type: String }],
    importedBy: { type: String, default: 'zorgax', trim: true, maxlength: 120 },
    status: { type: String, enum: ['committed', 'failed'], default: 'committed' },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.DataImportAudit ||
  mongoose.model('DataImportAudit', DataImportAuditSchema);
