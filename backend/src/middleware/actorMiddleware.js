const { upsertContributor } = require('../services/contributorsService');

function actorMiddleware(req, res, next) {
  const name = (req.header('x-actor-name') || '').trim();
  const phone = (req.header('x-actor-phone') || '').trim();

  if (name && phone) {
    req.actor = { name, phone };

    upsertContributor({ name, phone }).catch(() => {
      // swallow: actor should not fail the request
    });
  } else {
    req.actor = null;
  }

  next();
}

module.exports = { actorMiddleware };
