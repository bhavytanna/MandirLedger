const { User } = require('../models/User');
const { HttpError } = require('../utils/httpError');
const { signToken, verifyPassword } = require('../services/authService');

async function login(req, res) {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');

  if (!username || !password) {
    throw new HttpError(400, 'username and password are required');
  }

  const user = await User.findOne({ username });
  if (!user) throw new HttpError(401, 'Invalid credentials');

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');

  const token = signToken({
    user_id: String(user._id),
    username: user.username,
    role: user.role,
    name: user.name,
    phone: user.phone,
  });

  res.json({
    token,
    user: {
      username: user.username,
      role: user.role,
      name: user.name,
      phone: user.phone,
    },
  });
}

async function me(req, res) {
  if (!req.user) throw new HttpError(401, 'Authentication required');
  res.json({ user: req.user });
}

module.exports = { login, me };
