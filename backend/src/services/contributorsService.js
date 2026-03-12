const { Contributor } = require('../models/Contributor');

async function upsertContributor({ name, phone }) {
  await Contributor.findOneAndUpdate(
    { phone },
    { $set: { name, phone } },
    { upsert: true, new: true }
  );
}

module.exports = { upsertContributor };
