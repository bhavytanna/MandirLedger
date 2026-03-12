const PDFDocument = require('pdfkit');

const { Donation } = require('../models/Donation');
const { Receipt } = require('../models/Receipt');
const { HttpError } = require('../utils/httpError');
const { generateId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityLogService');

function requireActor(req) {
  if (!req.actor) {
    throw new HttpError(401, 'Authentication required');
  }
}

async function createReceiptFromDonation(req, res) {
  requireActor(req);

  const donationId = req.params.donationId;
  const donation = await Donation.findOne({ donation_id: donationId });
  if (!donation) throw new HttpError(404, 'Donation not found');

  const existing = await Receipt.findOne({ donation_id: donation.donation_id });
  if (existing) {
    return res.status(200).json({ receipt: existing });
  }

  const receipt_id = await generateId({ key: 'receipt', prefix: 'R', width: 5 });
  const temple_name = process.env.TEMPLE_NAME || 'MandirLedger Temple';

  const receipt = await Receipt.create({
    receipt_id,
    donation_id: donation.donation_id,
    temple_name,
    donor_name: donation.donor_name,
    amount: donation.amount,
    donated_at: donation.donated_at,
    payment_mode: donation.payment_mode,
    added_by: req.actor,
  });

  await logActivity({
    action: 'create',
    entity: 'receipt',
    entity_id: receipt.receipt_id,
    actor: req.actor,
    details: `${req.actor.name} generated receipt ${receipt.receipt_id} for donation ${donation.donation_id}`,
  });

  res.status(201).json({ receipt });
}

async function streamReceiptPdf(req, res) {
  const receiptId = req.params.receiptId;
  const receipt = await Receipt.findOne({ receipt_id: receiptId });
  if (!receipt) throw new HttpError(404, 'Receipt not found');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${receipt.receipt_id}.pdf`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text(receipt.temple_name, { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(14).text(`Receipt ID: ${receipt.receipt_id}`);
  doc.text(`Donor Name: ${receipt.donor_name}`);
  doc.text(`Amount: ₹${receipt.amount}`);
  doc.text(`Date: ${new Date(receipt.donated_at).toLocaleString()}`);
  doc.text(`Payment Mode: ${receipt.payment_mode}`);
  doc.moveDown(1);
  doc.text(`Added By: ${receipt.added_by.name} (${receipt.added_by.phone})`);

  doc.moveDown(2);
  doc.fontSize(10).text('This is a computer generated receipt.', { align: 'center' });

  doc.end();
}

module.exports = { createReceiptFromDonation, streamReceiptPdf };
