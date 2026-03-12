const { Donation } = require('../models/Donation');
const { Member } = require('../models/Member');
const { createDonationSchema, updateDonationSchema } = require('../validation/donationsValidation');
const { paginationSchema } = require('../validation/common');
const { HttpError } = require('../utils/httpError');
const { generateId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityLogService');

function requireActor(req) {
  if (!req.actor) {
    throw new HttpError(401, 'Authentication required');
  }
}

async function createDonation(req, res) {
  requireActor(req);

  const data = createDonationSchema.parse(req.body || {});

  let donorName = (data.donor_name || '').trim();
  let member = null;

  if (data.member_id) {
    member = await Member.findOne({ member_id: data.member_id });
    if (!member) throw new HttpError(400, 'member_id is invalid');
    donorName = member.name;
  }

  if (!donorName) {
    throw new HttpError(400, 'donor_name is required if member_id is not provided');
  }

  const donation_id = await generateId({ key: 'donation', prefix: 'D', width: 4 });

  const donation = await Donation.create({
    donation_id,
    member_id: data.member_id || null,
    donor_name: donorName,
    amount: data.amount,
    pay_later_amount: data.pay_later_amount || 0,
    donation_type: data.donation_type,
    payment_mode: data.payment_mode,
    transaction_reference: data.transaction_reference,
    donated_at: data.donated_at,
    added_by: req.actor,
  });

  const who = member ? `${member.name} (${member.member_id})` : donorName;
  const future = donation.pay_later_amount ? `, future ₹${donation.pay_later_amount}` : '';

  await logActivity({
    action: 'create',
    entity: 'donation',
    entity_id: donation.donation_id,
    actor: req.actor,
    details: `${req.actor.name} added donation ₹${donation.amount}${future} for ${who}`,
    timestamp: donation.created_at,
  });

  res.status(201).json({ donation });
}

async function listDonations(req, res) {
  const { page, limit } = paginationSchema.parse(req.query || {});
  const member_id = (req.query.member_id || '').trim();
  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  const q = (req.query.q || '').trim();

  const filter = {};
  if (member_id) filter.member_id = member_id;

  if (from || to) {
    filter.donated_at = {};
    if (from && !Number.isNaN(from.getTime())) filter.donated_at.$gte = from;
    if (to && !Number.isNaN(to.getTime())) filter.donated_at.$lte = to;
  }

  if (q) {
    filter.$or = [
      { donor_name: { $regex: q, $options: 'i' } },
      { donation_id: { $regex: q, $options: 'i' } },
      { member_id: { $regex: q, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Donation.find(filter)
      .sort({ donated_at: -1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Donation.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  });
}

async function getDonation(req, res) {
  const donationId = req.params.donationId;
  const donation = await Donation.findOne({ donation_id: donationId });
  if (!donation) throw new HttpError(404, 'Donation not found');
  res.json({ donation });
}

async function updateDonation(req, res) {
  requireActor(req);

  const donationId = req.params.donationId;
  const patch = updateDonationSchema.parse(req.body || {});

  const before = await Donation.findOne({ donation_id: donationId });
  if (!before) throw new HttpError(404, 'Donation not found');

  if (patch.member_id) {
    const member = await Member.findOne({ member_id: patch.member_id });
    if (!member) throw new HttpError(400, 'member_id is invalid');
    patch.donor_name = member.name;
  }

  if (patch.member_id === null) {
    if (!patch.donor_name) {
      throw new HttpError(400, 'donor_name is required when removing member_id');
    }
  }

  const donation = await Donation.findOneAndUpdate(
    { donation_id: donationId },
    { $set: patch },
    { new: true }
  );

  await logActivity({
    action: 'update',
    entity: 'donation',
    entity_id: donation.donation_id,
    actor: req.actor,
    details: `${req.actor.name} updated donation ${donation.donation_id} (paid ₹${before.amount}→₹${donation.amount}, future ₹${before.pay_later_amount || 0}→₹${donation.pay_later_amount || 0})`,
  });

  res.json({ donation });
}

module.exports = {
  createDonation,
  listDonations,
  getDonation,
  updateDonation,
};
