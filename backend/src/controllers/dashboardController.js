const { Member } = require('../models/Member');
const { Donation } = require('../models/Donation');

async function getDashboard(req, res) {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

  const [
    totalMembers,
    totalDonationsAgg,
    recentDonations,
    memberPendingAgg,
    nonMemberOriginalPromises,
  ] = await Promise.all([
    Member.countDocuments({ archived: false }),
    Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Donation.find({}).sort({ donated_at: -1, created_at: -1 }).limit(10),

    // Member pending: max pay_later_amount (original promise) per member within the year,
    // minus total "Pending Paid" follow-up payments in the year
    Donation.aggregate([
      { $match: { donated_at: { $gte: start, $lt: end }, member_id: { $ne: null } } },
      { $sort: { donated_at: 1, created_at: 1 } },
      {
        $group: {
          _id: '$member_id',
          original_pay_later: { $max: '$pay_later_amount' },
          pending_paid_sum: {
            $sum: {
              $cond: [{ $eq: ['$donation_type', 'Pending Paid'] }, '$amount', 0],
            },
          },
        },
      },
      {
        $addFields: {
          outstanding: { $max: [0, { $subtract: ['$original_pay_later', '$pending_paid_sum'] }] },
        },
      },
      { $match: { outstanding: { $gt: 0 } } },
      { $group: { _id: null, total_pending: { $sum: '$outstanding' } } },
    ]),

    // Non-member pending: Stage 1 – find original promise per donor (first donation with pay_later > 0)
    Donation.aggregate([
      { $match: { member_id: null, pay_later_amount: { $gt: 0 } } },
      { $sort: { donated_at: 1, created_at: 1 } },
      {
        $group: {
          _id: '$donor_name',
          original_amount_paid: { $first: '$amount' },
          original_pay_later: { $first: '$pay_later_amount' },
        },
      },
    ]),
  ]);

  // Non-member pending: Stage 2 – sum ALL payments (including Pending Paid) per donor
  let nonMemberPending = 0;
  if (nonMemberOriginalPromises.length > 0) {
    const donorNames = nonMemberOriginalPromises.map((r) => r._id);
    const allPaymentsAgg = await Donation.aggregate([
      { $match: { member_id: null, donor_name: { $in: donorNames } } },
      {
        $group: {
          _id: '$donor_name',
          total_paid_all: { $sum: '$amount' },
        },
      },
    ]);
    const allPaymentsMap = new Map(allPaymentsAgg.map((r) => [r._id, r.total_paid_all]));

    for (const promise of nonMemberOriginalPromises) {
      const promised_total = promise.original_amount_paid + promise.original_pay_later;
      const total_paid = allPaymentsMap.get(promise._id) || 0;
      const outstanding = Math.max(0, promised_total - total_paid);
      nonMemberPending += outstanding;
    }
  }

  const totalDonations = totalDonationsAgg[0]?.total || 0;
  const memberPending = Math.max(0, memberPendingAgg[0]?.total_pending || 0);
  const pendingContributions = memberPending + nonMemberPending;

  res.json({
    year,
    totals: {
      members: totalMembers,
      donations_amount: totalDonations,
      pending_contributions_amount: pendingContributions,
    },
    recent_donations: recentDonations,
  });
}

module.exports = { getDashboard };
