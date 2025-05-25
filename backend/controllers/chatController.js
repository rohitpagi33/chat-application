const Chat = require("../models/Chat");
const User = require("../models/User");

const createChat = async (req, res) => {
  try {
    const { currentUserId, currentotherUserId } = req.body;

    if (!currentUserId || !currentotherUserId) {
      return res.status(400).json({ error: "User IDs are required" });
    }

    // Find existing 1-on-1 chat (not group) between these users
    const existingChat = await Chat.findOne({
      isGroupChat: false,                 // Ensure it's not a group chat
      users: {
        $all: [currentUserId, currentotherUserId], // Contains both users
        $size: 2                           // Exactly 2 users (1-on-1 chat)
      }
    }).populate("users", "fullName username");

    if (existingChat) {
      // Return existing chat if found
      return res.status(200).json(existingChat);
    }

    // Verify users exist (optional but good practice)
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(currentotherUserId);
    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create new 1-on-1 chat
    const newChat = new Chat({
      chatName: `${currentUser.fullName} - ${otherUser.fullName}`,
      isGroupChat: false,
      users: [currentUserId, currentotherUserId],
    });

    await newChat.save();

    // Populate users before sending response
    const fullChat = await newChat.populate("users", "fullName username").execPopulate();

    return res.status(201).json(fullChat);
  } catch (err) {
    console.error("Error creating chat:", err);
    return res.status(500).json({ error: "Failed to create chat" });
  }
};

const fetchChat = async (req, res) => {
  try {
    console.log("Request body:", req.body); // ✅ Add this
    const { currentUserId } = req.body;

    if (!currentUserId) {
      return res.status(400).json({ error: "currentUserId is required" });
    }

    const chats = await Chat.find({ users: { $in: [currentUserId] } })
      .populate("users", "fullName username")
      .sort({ updatedAt: -1 })
      .limit(10);

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { createChat, fetchChat };

