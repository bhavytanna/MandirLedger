const { Member } = require('../models/Member');
const { Donation } = require('../models/Donation');
const { createMemberSchema, updateMemberSchema } = require('../validation/membersValidation');
const { paginationSchema } = require('../validation/common');
const { HttpError } = require('../utils/httpError');
const { generateId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityLogService');

function requireActor(req) {
  if (!req.actor) {
    throw new HttpError(401, 'Authentication required');
  }
}

async function createMember(req, res) {
  requireActor(req);

  const data = createMemberSchema.parse(req.body || {});
  const member_id = await generateId({ key: 'member', prefix: 'M', width: 3 });

  const member = await Member.create({
    member_id,
    name: data.name,
    phone: data.phone,
    address: data.address,
    family_name: data.family_name,
    created_by: req.actor,
  });

  await logActivity({
    action: 'create',
    entity: 'member',
    entity_id: member.member_id,
    actor: req.actor,
    details: `${req.actor.name} added member ${member.name} (${member.member_id})`,
  });

  res.status(201).json({ member });
}

async function listMembers(req, res) {
  const { page, limit } = paginationSchema.parse(req.query || {});
  const q = (req.query.q || '').trim();
  const includeArchived = String(req.query.include_archived || 'false') === 'true';

  const filter = {};
  if (!includeArchived) filter.archived = false;

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { member_id: { $regex: q, $options: 'i' } },
      { family_name: { $regex: q, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Member.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Member.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  });
}

async function getMember(req, res) {
  const memberId = req.params.memberId;

  const member = await Member.findOne({ member_id: memberId });
  if (!member) throw new HttpError(404, 'Member not found');

  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

  const donations = await Donation.find({ member_id: member.member_id })
    .sort({ donated_at: -1, created_at: -1 })
    .limit(200);

  const total_donated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const donations_count = donations.length;

  const yearlyAgg = await Donation.aggregate([
    { $match: { member_id: member.member_id, donated_at: { $gte: start, $lt: end } } },
    { $sort: { donated_at: -1, created_at: -1 } },
    {
      $group: {
        _id: null,
        paid: { $sum: '$amount' },
        pending: { $first: '$pay_later_amount' },
      },
    },
  ]);
  const paid = yearlyAgg[0]?.paid || 0;
  const pending = Math.max(0, yearlyAgg[0]?.pending || 0);

  res.json({
    member,
    donation_history: {
      items: donations,
      total_donated,
      donations_count,
    },
    contribution: {
      year,
      paid,
      pending,
    },
  });
}

async function updateMember(req, res) {
  requireActor(req);

  const memberId = req.params.memberId;
  const patch = updateMemberSchema.parse(req.body || {});

  const member = await Member.findOneAndUpdate(
    { member_id: memberId },
    { $set: patch },
    { new: true }
  );

  if (!member) throw new HttpError(404, 'Member not found');

  await logActivity({
    action: 'update',
    entity: 'member',
    entity_id: member.member_id,
    actor: req.actor,
    details: `${req.actor.name} updated member ${member.name} (${member.member_id})`,
  });

  res.json({ member });
}

async function deleteMember(req, res) {
  requireActor(req);

  const memberId = req.params.memberId;

  const member = await Member.findOne({ member_id: memberId });
  if (!member) throw new HttpError(404, 'Member not found');

  const donationsCount = await Donation.countDocuments({ member_id: member.member_id });
  if (donationsCount > 0) {
    throw new HttpError(409, 'Cannot delete member with donations. Archive member instead.');
  }

  await Member.deleteOne({ member_id: memberId });

  await logActivity({
    action: 'delete',
    entity: 'member',
    entity_id: member.member_id,
    actor: req.actor,
    details: `${req.actor.name} deleted member ${member.name} (${member.member_id})`,
  });

  res.json({ ok: true });
}

async function archiveMember(req, res) {
  requireActor(req);

  const memberId = req.params.memberId;

  const member = await Member.findOneAndUpdate(
    { member_id: memberId },
    { $set: { archived: true } },
    { new: true }
  );

  if (!member) throw new HttpError(404, 'Member not found');

  await logActivity({
    action: 'archive',
    entity: 'member',
    entity_id: member.member_id,
    actor: req.actor,
    details: `${req.actor.name} archived member ${member.name} (${member.member_id})`,
  });

  res.json({ member });
}

module.exports = {
  createMember,
  listMembers,
  getMember,
  updateMember,
  archiveMember,
  deleteMember,
};
