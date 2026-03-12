const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

contributorSchema.index({ phone: 1 }, { unique: true });

const Contributor = mongoose.model('Contributor', contributorSchema, 'contributors');

module.exports = { Contributor };
