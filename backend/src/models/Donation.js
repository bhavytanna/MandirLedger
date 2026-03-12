const mongoose = require('mongoose');
const { actorSchema } = require('./Member');

const donationSchema = new mongoose.Schema(
  {
    donation_id: { type: String, required: true, unique: true, index: true },
    member_id: { type: String, default: null, index: true },
    donor_name: { type: String, required: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    pay_later_amount: { type: Number, default: 0, min: 0 },
    donation_type: { type: String, default: '', trim: true },
    payment_mode: { type: String, required: true, enum: ['cash', 'upi', 'bank'] },
    transaction_reference: { type: String, default: '', trim: true },
    donated_at: { type: Date, required: true, index: true },
    added_by: { type: actorSchema, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

const Donation = mongoose.model('Donation', donationSchema, 'donations');

module.exports = { Donation };
