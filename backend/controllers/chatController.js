const Chat = require('../models/Chat');
const User = require('../models/User');

const createOrGetDirectChat = async (req, res) => {
  const { userId, otherUserId } = req.body;

  if (!userId || !otherUserId) {
    return res.status(400).json({ error: 'userId and otherUserId are required' });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [userId, otherUserId], $size: 2 }
    }).populate('users', 'username fullName');

    if (chat) {
      console.log('🟢 Existing chat found');
      return res.json(chat);
    }

    chat = new Chat({
      chatName: 'Direct Chat',
      isGroupChat: false,
      users: [userId, otherUserId]
    });

    await chat.save();

    chat = await Chat.findById(chat._id).populate('users', 'username fullName');

    console.log('🆕 New chat created');
    res.status(201).json(chat);
  } catch (error) {
    console.error('❌ Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};


module.exports = {
  createOrGetDirectChat,
};
