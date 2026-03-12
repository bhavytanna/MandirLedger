const { Member } = require('../models/Member');
const { Donation } = require('../models/Donation');
const { Receipt } = require('../models/Receipt');
const { ActivityLog } = require('../models/ActivityLog');
const { Contributor } = require('../models/Contributor');
const { Counter } = require('../models/Counter');
const { PendingSettings } = require('../models/PendingSettings');
const { HttpError } = require('../utils/httpError');

async function wipeAllData(req, res) {
  const confirm = String(req.body?.confirm || '').trim();
  if (confirm !== 'WIPE') {
    throw new HttpError(400, 'Confirmation required. Provide {"confirm":"WIPE"}.');
  }

  await Promise.all([
    Member.deleteMany({}),
    Donation.deleteMany({}),
    Receipt.deleteMany({}),
    ActivityLog.deleteMany({}),
    Contributor.deleteMany({}),
    Counter.deleteMany({}),
    PendingSettings.deleteMany({}),
  ]);

  res.json({ ok: true });
}

module.exports = { wipeAllData };
