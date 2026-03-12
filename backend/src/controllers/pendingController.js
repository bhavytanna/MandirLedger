const { Donation } = require('../models/Donation');
const { Member } = require('../models/Member');
const { HttpError } = require('../utils/httpError');
const { generateId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityLogService');

/* ──────────────────────────────────────────────
   MEMBER pending list
   Aggregates donations within a year where member_id != null
   Correctly computes outstanding = original pay_later - all subsequent pending payments
────────────────────────────────────────────── */
async function getPendingList(req, res) {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

  const agg = await Donation.aggregate([
    { $match: { donated_at: { $gte: start, $lt: end }, member_id: { $ne: null } } },
    { $sort: { donated_at: 1, created_at: 1 } },
    {
      $group: {
        _id: '$member_id',
        // Sum of all donation amounts in the year
        total_paid: { $sum: '$amount' },
        // Max pay_later_amount ever set (original promise)
        original_pay_later: { $max: '$pay_later_amount' },
        // Sum of follow-up "Pending Paid" payments
        pending_paid_sum: {
          $sum: {
            $cond: [{ $eq: ['$donation_type', 'Pending Paid'] }, '$amount', 0],
          },
        },
      },
    },
  ]);

  const map = new Map(agg.map((r) => [
    r._id,
    {
      total_paid: r.total_paid || 0,
      original_pay_later: r.original_pay_later || 0,
      pending_paid_sum: r.pending_paid_sum || 0,
    },
  ]));

  const members = await Member.find({ archived: false }).sort({ member_id: 1 });

  const items = members.map((m) => {
    const row = map.get(m.member_id) || { total_paid: 0, original_pay_later: 0, pending_paid_sum: 0 };
    // Outstanding = what was promised to pay later - what has since been paid as pending payments
    const outstanding = Math.max(0, row.original_pay_later - row.pending_paid_sum);
    return {
      member_id: m.member_id,
      name: m.name,
      phone: m.phone,
      family_name: m.family_name,
      paid: row.total_paid,
      pending: outstanding,
      original_pay_later: row.original_pay_later,
    };
  }).filter((it) => it.pending > 0);

  const total_pending = items.reduce((sum, it) => sum + it.pending, 0);

  res.json({ year, total_pending, items });
}

/* ──────────────────────────────────────────────
   Mark member pending payment (full or partial)
   Creates a new donation of type "Pending Paid" for the member
────────────────────────────────────────────── */
async function markMemberPaid(req, res) {
  if (!req.actor) throw new HttpError(401, 'Authentication required');

  const { member_id, amount, payment_mode, year } = req.body || {};

  if (!member_id || typeof member_id !== 'string' || !member_id.trim()) {
    throw new HttpError(400, 'member_id is required');
  }
  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    throw new HttpError(400, 'amount must be a positive number');
  }
  const mode = payment_mode || 'cash';
  if (!['cash', 'upi', 'bank'].includes(mode)) {
    throw new HttpError(400, 'payment_mode must be cash, upi, or bank');
  }

  const member = await Member.findOne({ member_id: member_id.trim(), archived: false });
  if (!member) throw new HttpError(404, `Member ${member_id} not found`);

  const yr = year ? Number(year) : new Date().getFullYear();
  const now = new Date();
  const donatedAt = Number.isFinite(yr)
    ? new Date(Date.UTC(yr, now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()))
    : now;

  const donation_id = await generateId({ key: 'donation', prefix: 'D', width: 4 });

  const donation = await Donation.create({
    donation_id,
    member_id: member_id.trim(),
    donor_name: member.name,
    amount: parsedAmount,
    pay_later_amount: 0,
    donation_type: 'Pending Paid',
    payment_mode: mode,
    transaction_reference: '',
    donated_at: donatedAt,
    added_by: req.actor,
  });

  await logActivity({
    action: 'create',
    entity: 'donation',
    entity_id: donation.donation_id,
    actor: req.actor,
    details: `${req.actor.name} recorded pending payment ₹${parsedAmount} for member ${member_id.trim()} (${member.name})`,
    timestamp: donation.created_at,
  });

  res.status(201).json({ donation });
}

/* ──────────────────────────────────────────────
   NON-MEMBER pending list
   Returns donations where member_id IS null AND pay_later_amount > 0
   that have NOT yet been fully settled.
────────────────────────────────────────────── */
async function getNonMemberPendingList(req, res) {
  // Stage 1: Find all non-member donors who ever had a pay_later_amount > 0
  // Get their original promise details (first donation with pay_later set)
  const originalPromises = await Donation.aggregate([
    { $match: { member_id: null, pay_later_amount: { $gt: 0 } } },
    { $sort: { donated_at: 1, created_at: 1 } }, // Earliest first to get the original promise
    {
      $group: {
        _id: '$donor_name',
        original_donation_id: { $first: '$donation_id' },
        original_donated_at: { $first: '$donated_at' },
        original_amount_paid: { $first: '$amount' },       // Amount paid at time of promise
        original_pay_later: { $first: '$pay_later_amount' }, // Original promised-to-pay-later
        payment_mode: { $first: '$payment_mode' },
        donation_type: { $first: '$donation_type' },
      },
    },
  ]);

  if (originalPromises.length === 0) {
    return res.json({ total_pending: 0, items: [] });
  }

  // Stage 2: For each donor with a promise, sum ALL their donations (including Pending Paid follow-ups)
  const donorNames = originalPromises.map((r) => r._id);

  const allPayments = await Donation.aggregate([
    { $match: { member_id: null, donor_name: { $in: donorNames } } },
    {
      $group: {
        _id: '$donor_name',
        total_paid_all: { $sum: '$amount' },  // Sum of ALL payments ever
        latest_donation_id: { $last: '$donation_id' },
        latest_donated_at: { $max: '$donated_at' },
      },
    },
  ]);

  const allPaymentsMap = new Map(allPayments.map((r) => [r._id, r]));

  const items = [];
  for (const promise of originalPromises) {
    const donorName = promise._id;
    const allPay = allPaymentsMap.get(donorName);
    if (!allPay) continue;

    // promised_total = what they paid initially + what they promised to pay later
    const promised_total = promise.original_amount_paid + promise.original_pay_later;
    // outstanding = everything promised - everything they have paid so far (all records)
    const outstanding = Math.max(0, promised_total - allPay.total_paid_all);

    if (outstanding <= 0) continue; // Fully paid, skip

    items.push({
      donor_name: donorName,
      latest_donation_id: allPay.latest_donation_id,
      latest_donated_at: allPay.latest_donated_at,
      total_paid: allPay.total_paid_all,
      promised_total,
      outstanding,
      payment_mode: promise.payment_mode,
      donation_type: promise.donation_type,
    });
  }

  // Sort by latest activity
  items.sort((a, b) => new Date(b.latest_donated_at) - new Date(a.latest_donated_at));

  const total_pending = items.reduce((sum, it) => sum + it.outstanding, 0);

  res.json({ total_pending, items });
}

/* ──────────────────────────────────────────────
   Mark non-member partial payment as paid
   Creates a new donation record for the remaining amount
────────────────────────────────────────────── */
async function markNonMemberPaid(req, res) {
  if (!req.actor) throw new HttpError(401, 'Authentication required');

  const { donor_name, amount, payment_mode, donation_type } = req.body || {};

  if (!donor_name || typeof donor_name !== 'string' || !donor_name.trim()) {
    throw new HttpError(400, 'donor_name is required');
  }
  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    throw new HttpError(400, 'amount must be a positive number');
  }
  const mode = payment_mode || 'cash';
  if (!['cash', 'upi', 'bank'].includes(mode)) {
    throw new HttpError(400, 'payment_mode must be cash, upi, or bank');
  }

  const donation_id = await generateId({ key: 'donation', prefix: 'D', width: 4 });

  const donation = await Donation.create({
    donation_id,
    member_id: null,
    donor_name: donor_name.trim(),
    amount: parsedAmount,
    pay_later_amount: 0,
    donation_type: donation_type || 'Pending Paid',
    payment_mode: mode,
    transaction_reference: '',
    donated_at: new Date(),
    added_by: req.actor,
  });

  await logActivity({
    action: 'create',
    entity: 'donation',
    entity_id: donation.donation_id,
    actor: req.actor,
    details: `${req.actor.name} recorded pending payment ₹${parsedAmount} from non-member ${donor_name.trim()}`,
    timestamp: donation.created_at,
  });

  res.status(201).json({ donation });
}

async function getSettings(req, res) {
  throw new HttpError(404, 'Pending settings are not configurable. Expected yearly contribution is fixed at ₹2000.');
}

async function setSettings(req, res) {
  throw new HttpError(404, 'Pending settings are not configurable. Expected yearly contribution is fixed at ₹2000.');
}

module.exports = { getPendingList, markMemberPaid, getNonMemberPendingList, markNonMemberPaid, getSettings, setSettings };
