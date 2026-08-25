const mongoose = require('mongoose');

const EnvironmentalDataRecordSchema = new mongoose.Schema(
  {
    importBatchId: { type: String, required: true, index: true },
    datasetType: { type: String, required: true, trim: true, maxlength: 120 },
    source: { type: String, required: true, trim: true, maxlength: 240 },
    rowNumber: { type: Number, required: true, min: 1 },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    importedBy: { type: String, default: 'zorgax', trim: true, maxlength: 120 },
  },
  { timestamps: true, strict: true }
);

EnvironmentalDataRecordSchema.index(
  { importBatchId: 1, rowNumber: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.EnvironmentalDataRecord ||
  mongoose.model('EnvironmentalDataRecord', EnvironmentalDataRecordSchema);
