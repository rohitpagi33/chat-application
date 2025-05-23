const Chat = require('../models/Chat');
const User = require('../models/User');

exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send('UserId param not sent');
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    }).populate('users', '-password').populate('latestMessage');

    if (chat) {
      return res.send(chat);
    }

    const newChat = await Chat.create({
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await newChat.populate('users', '-password').execPopulate();
    res.status(200).send(fullChat);

  } catch (error) {
    res.status(500).json({ message: 'Failed to access or create chat', error });
  }
};

exports.getAllUsersExceptCurrent = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
};
