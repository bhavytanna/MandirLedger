const { Counter } = require('../models/Counter');

async function nextSequence(key) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return doc.seq;
}

function padNumber(n, width) {
  const s = String(n);
  if (s.length >= width) return s;
  return '0'.repeat(width - s.length) + s;
}

async function generateId({ key, prefix, width }) {
  const seq = await nextSequence(key);
  return `${prefix}${padNumber(seq, width)}`;
}

module.exports = { generateId };
