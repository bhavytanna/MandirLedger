const { ActivityLog } = require('../models/ActivityLog');
const { paginationSchema } = require('../validation/common');

async function listActivityLogs(req, res) {
  const { page, limit } = paginationSchema.parse(req.query || {});
  const entity = (req.query.entity || '').trim();

  const filter = {};
  if (entity) filter.entity = entity;

  const [items, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  });
}

module.exports = { listActivityLogs };
