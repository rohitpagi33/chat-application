const Chat = require("../models/Chat");
const User = require("../models/User");
const mongoose = require("mongoose");

const createChat = async (req, res) => {
  try {
    let { currentUserId, currentotherUserId } = req.body;

    if (!currentUserId || !currentotherUserId) {
      return res.status(400).json({ error: "User IDs are required" });
    }

    // Convert to mongoose ObjectId explicitly
    currentUserId = new mongoose.Types.ObjectId(currentUserId);
    currentotherUserId = new mongoose.Types.ObjectId(currentotherUserId);

    // Find existing 1-on-1 chat with exactly those users
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $size: 2, $all: [currentUserId, currentotherUserId] },
    }).populate("users", "fullName username");

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // Verify users exist
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(currentotherUserId);
    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const userIds = [currentUserId, currentotherUserId].sort();

    const newChat = new Chat({
      chatName: `${currentUser.fullName} - ${otherUser.fullName}`,
      isGroupChat: false,
      users: userIds,
    });
    await newChat.save();

    // Populate before sending
    const fullChat = await newChat.populate("users", "fullName username").execPopulate();

    return res.status(201).json(fullChat);
  } catch (err) {
    console.error("Error creating chat:", err);
    return res.status(500).json({ error: "Failed to create chat" });
  }
};

const fetchChat = async (req, res) => {
  try {
    //console.log("Request body:", req.body);
    const { currentUserId } = req.body;

    if (!currentUserId) {
      return res.status(400).json({ error: "currentUserId is required" });
    }

    const chats = await Chat.find({ users: { $in: [currentUserId] } })
      .populate("users", "fullName username")
      .populate({
    path: "latestMessage",
    populate: { path: "sender", select: "fullName username" }
  })
      .sort({ updatedAt: -1 })
      .limit(10);

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const createGroupChat = async (req, res) => {
  try {
    const { chatName, users, isGroupChat } = req.body;

    if (!chatName || !users || users.length === 0) {
      return res.status(400).json({ message: "Please provide group name and users" });
    }

    // Include current logged-in user in the group
    const allUsers = [...users, req.user._id];

    const groupChat = new Chat({
      chatName,
      users: allUsers,
      isGroupChat: isGroupChat || true,
    });

    await groupChat.save();

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("latestMessage");

    res.status(201).json(fullGroupChat);
  } catch (err) {
    console.error("Create group chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { createChat, fetchChat , createGroupChat };