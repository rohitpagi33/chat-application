const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");
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
    }).populate("users", "fullName username profilePhoto");

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
    const fullChat = await newChat
      .populate("users", "fullName username profilePhoto")
      .execPopulate();

    return res.status(201).json(fullChat);
  } catch (err) {
    console.error("Error creating chat:", err);
    return res.status(500).json({ error: "Failed to create chat" });
  }
};

const fetchChat = async (req, res) => {
  try {
    const { currentUserId } = req.body;
    if (!currentUserId) {
      return res.status(400).json({ error: "currentUserId is required" });
    }
    const userObjectId = new mongoose.Types.ObjectId(currentUserId);

    // Fetch chats for the user
    const chats = await Chat.find({ users: { $in: [userObjectId] } })
      .populate("users", "fullName username profilePhoto")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "fullName username profilePhoto" },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const chatIds = chats.map((chat) => chat._id);

    // Aggregate unread counts for each chat
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          chat: { $in: chatIds },
          isRead: false,
          sender: { $ne: userObjectId },
          readBy: { $ne: userObjectId },
        },
      },
      {
        $group: {
          _id: "$chat",
          unreadCount: { $sum: 1 },
        },
      },
    ]);

    // Map unread counts to chatId
    const unreadMap = {};
    unreadCounts.forEach((u) => {
      unreadMap[u._id.toString()] = u.unreadCount;
    });

    // Attach unreadCount to each chat
    const chatsWithUnread = chats.map((chat) => ({
      ...chat,
      unreadCount: unreadMap[chat._id.toString()] || 0,
    }));

    return res.status(200).json(chatsWithUnread);
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createGroupChat = async (req, res) => {
  console.log("REQ.BODY:", req.body); // Debug log

  const { chatName, users, isGroupChat, adminId, groupPhoto } = req.body;

  if (!chatName || !users || users.length < 1 || !adminId) {
    return res.status(400).json({ message: "Please provide chatName, at least 2 users, and adminId" });
  }

  try {
    const groupChat = new Chat({
      chatName,
      users,
      isGroupChat: true,
      admin: adminId,
      groupPhoto: groupPhoto || "", // Save the URL
    });

    await groupChat.save();

    res.status(201).json({ success: true, groupChat });
  } catch (err) {
    console.error("Error creating group chat:", err);
    res.status(500).json({ message: "Server error while creating group chat" });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("users", "fullName username _id profilePhoto") // <-- add profilePhoto
      .populate("admin", "fullName username _id profilePhoto") // <-- add profilePhoto
      .lean();

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // If admin is not a separate field, assume first user is admin
    let admin = chat.admin;
    if (!admin && chat.users && chat.users.length > 0) {
      admin = chat.users[0];
    }

    res.json({
      users: chat.users,
      admin,
      chatName: chat.chatName,
      createdAt: chat.createdAt,
      isGroupChat: chat.isGroupChat,
      _id: chat._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat" });
  }
};

const addMemberToGroup = async (req, res) => {
  const { chatId, userId } = req.body; // <-- get both from body
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Prevent duplicate
    if (chat.users.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    chat.users.push(userId);
    await chat.save();
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ message: "Failed to add member" });
  }
};

const leaveGroupChat = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.users = chat.users.filter(u => u.toString() !== userId);
    await chat.save();
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ message: "Failed to leave group" });
  }
};

module.exports = { createChat, fetchChat, createGroupChat, getChatById, addMemberToGroup, leaveGroupChat };
