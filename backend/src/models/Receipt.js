const mongoose = require('mongoose');
const { actorSchema } = require('./Member');

const receiptSchema = new mongoose.Schema(
  {
    receipt_id: { type: String, required: true, unique: true, index: true },
    donation_id: { type: String, required: true, index: true },
    temple_name: { type: String, required: true },
    donor_name: { type: String, required: true },
    amount: { type: Number, required: true },
    donated_at: { type: Date, required: true },
    payment_mode: { type: String, required: true },
    added_by: { type: actorSchema, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

const Receipt = mongoose.model('Receipt', receiptSchema, 'receipts');

module.exports = { Receipt };
