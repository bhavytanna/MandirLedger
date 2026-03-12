const mongoose = require('mongoose');

const pendingSettingsSchema = new mongoose.Schema(
  {
    expected_yearly_contribution: { type: Number, required: true, min: 0, default: 2000 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

const PendingSettings = mongoose.model('PendingSettings', pendingSettingsSchema, 'pending_settings');

module.exports = { PendingSettings };
