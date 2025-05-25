const Chat = require("../models/Chat");
const User = require("../models/User");

// Create a new chat between two users
const createChat = async (req, res) => {
  try {
    const { currentUserId, currentotherUserId } = req.body;
    // Check if both user IDs are provided
    if (!currentUserId || !currentotherUserId) {
      return res.status(400).json({ error: "User IDs are required" });
    }
    // Check if both users exist
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(currentotherUserId);

    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // Create the chat
    const newChat = new Chat({
      users: [currentUserId, currentotherUserId],
      chatName: `${currentUser.fullName} - ${otherUser.fullName}`, // Optionally name the chat
    });

    await newChat.save();

    return res.status(201).json(newChat);
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

