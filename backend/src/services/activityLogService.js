const { ActivityLog } = require('../models/ActivityLog');

async function logActivity({
  action,
  entity,
  entity_id,
  actor,
  details,
  timestamp,
}) {
  if (!actor) return;

  await ActivityLog.create({
    action,
    entity,
    entity_id,
    actor_name: actor.name,
    actor_phone: actor.phone,
    timestamp: timestamp || new Date(),
    details: details || '',
  });
}

module.exports = { logActivity };
