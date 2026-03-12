const { HttpError } = require('../utils/httpError');
const { verifyToken } = require('../services/authService');

function authMiddleware(req, res, next) {
  const header = String(req.header('authorization') || '').trim();
  const token = header.toLowerCase().startsWith('bearer ')
    ? header.slice(7).trim()
    : String(req.query?.token || '').trim();

  if (!token) {
    req.user = null;
    req.actor = null;
    return next();
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      name: payload.name,
      phone: payload.phone,
    };
    req.actor = { name: payload.name, phone: payload.phone };
    return next();
  } catch (e) {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return next(new HttpError(401, 'Authentication required'));
  }
  return next();
}

function requireEditor(req, res, next) {
  if (!req.user) {
    return next(new HttpError(401, 'Authentication required'));
  }
  if (req.user.role !== 'editor') {
    return next(new HttpError(403, 'Editor role required'));
  }
  return next();
}

module.exports = { authMiddleware, requireAuth, requireEditor };
