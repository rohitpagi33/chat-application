const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  media: {
    url: { type: String },
    type: { type: String }, // image, video, audio, file
  },
  messageType: { type: String, default: "text" },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
