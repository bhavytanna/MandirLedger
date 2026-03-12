const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return secret;
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function signToken({ user_id, username, role, name, phone }) {
  return jwt.sign(
    { sub: user_id, username, role, name, phone },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
};
