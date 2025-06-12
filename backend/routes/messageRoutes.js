import express from 'express';
const router = express.Router();
import Message from '../models/Message.js';

// Get all messages for a chat
router.get('/:chatId', async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username fullName')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.body; // Pass userId in request body
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    // Only sender can delete
    if (String(msg.sender) !== String(userId)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    // Only within 2 minutes
    const now = new Date();
    const sent = new Date(msg.createdAt);
    if ((now - sent) > 2 * 60 * 1000) {
      return res.status(403).json({ error: "Delete window expired" });
    }

    await msg.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
