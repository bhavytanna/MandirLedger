const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entity_id: { type: String, required: true, index: true },
    actor_name: { type: String, required: true },
    actor_phone: { type: String, required: true },
    timestamp: { type: Date, required: true, default: () => new Date(), index: true },
    details: { type: String, default: '' },
  },
  { versionKey: false }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema, 'activity_logs');

module.exports = { ActivityLog };
