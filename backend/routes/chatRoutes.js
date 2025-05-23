const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// Get all chats for a user (userId as query param for simplicity)
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const chats = await Chat.find({ users: userId })
      .populate('users', 'username fullName')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'username fullName' }
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Create (or find existing) one-on-one chat with another user
router.post('/', async (req, res) => {
  const { userId, otherUserId } = req.body;
  if (!userId || !otherUserId) {
    return res.status(400).json({ error: 'userId and otherUserId are required' });
  }

  try {
    // Check if chat between these two users already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [userId, otherUserId], $size: 2 }
    }).populate('users', 'username fullName');

    if (chat) {
      return res.json(chat);
    }

    // Create new chat
    chat = new Chat({
      chatName: 'Direct Chat',
      isGroupChat: false,
      users: [userId, otherUserId]
    });

    await chat.save();

    // Populate users before sending back
    chat = await Chat.findById(chat._id).populate('users', 'username fullName');
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

module.exports = router;
