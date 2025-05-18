const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  isGroupChat: { type: Boolean, default: false },
  chatName: { type: String },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
