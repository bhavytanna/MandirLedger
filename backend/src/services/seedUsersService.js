const { User } = require('../models/User');
const { hashPassword } = require('./authService');

async function ensureUser({ username, password, role, name }) {
  if (!username || !password) return;

  const existing = await User.findOne({ username });
  if (existing) return;

  const password_hash = await hashPassword(password);

  await User.create({
    username,
    role,
    name: name || username,
    phone: `role:${role}`,
    password_hash,
  });
}

async function seedInitialUsers() {
  await ensureUser({
    username: process.env.EDITOR_USERNAME,
    password: process.env.EDITOR_PASSWORD,
    role: 'editor',
    name: process.env.EDITOR_NAME,
  });

  await ensureUser({
    username: process.env.VIEWER_USERNAME,
    password: process.env.VIEWER_PASSWORD,
    role: 'viewer',
    name: process.env.VIEWER_NAME,
  });
}

module.exports = { seedInitialUsers };
