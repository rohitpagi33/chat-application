// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  mobile: { type: String, unique: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
  },{
  collection: 'user'
});

module.exports = mongoose.model('User', userSchema);
