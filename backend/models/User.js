const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true }, // hashed password
  avatar: { type: String },
  status: { type: String, default: "Hey there! I am using ChatApp." },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
