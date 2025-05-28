// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  content: String,
  media: String,
  messageType: { type: String, default: 'text' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
