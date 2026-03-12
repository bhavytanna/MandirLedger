const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema(
  {
    member_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, default: '', trim: true },
    family_name: { type: String, default: '', trim: true, index: true },
    archived: { type: Boolean, default: false, index: true },
    created_by: { type: actorSchema, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

const Member = mongoose.model('Member', memberSchema, 'members');

module.exports = { Member, actorSchema };
