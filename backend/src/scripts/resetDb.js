require('dotenv').config();

const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const { Member } = require('../models/Member');
const { Donation } = require('../models/Donation');
const { Receipt } = require('../models/Receipt');
const { ActivityLog } = require('../models/ActivityLog');
const { Contributor } = require('../models/Contributor');
const { Counter } = require('../models/Counter');
const { PendingSettings } = require('../models/PendingSettings');

async function resetDb() {
  if (process.env.CONFIRM_RESET !== 'YES') {
    throw new Error('Refusing to reset DB. Set CONFIRM_RESET=YES to confirm.');
  }

  await connectDb(process.env.MONGODB_URI);

  await Promise.all([
    Member.deleteMany({}),
    Donation.deleteMany({}),
    Receipt.deleteMany({}),
    ActivityLog.deleteMany({}),
    Contributor.deleteMany({}),
    Counter.deleteMany({}),
    PendingSettings.deleteMany({}),
  ]);

  await mongoose.connection.close();
}

resetDb().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  try {
    await mongoose.connection.close();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
