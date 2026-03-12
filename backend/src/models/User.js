const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ['viewer', 'editor'], index: true },
    password_hash: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

const User = mongoose.model('User', userSchema, 'users');

module.exports = { User };
