import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  content: String,
  file: {
    url: { type: String },
    type: { type: String },
    name: { type: String },
  },
  messageType: { type: String, default: 'text' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});


const Message = mongoose.model("Message", messageSchema);
export default Message;