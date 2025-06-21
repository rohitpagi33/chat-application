import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import path from "path";
import Message from "./models/Message.js";
import Chat from "./models/Chat.js";

import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const __dirname = path.resolve();

app.use((req, res, next) => {
  console.log("Request received:", req.method, req.originalUrl);
  next();
});

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (_, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// Create server for socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("mark-read", async ({ chatId, userId }) => {
    try {
      await Message.updateMany(
        { chat: chatId, sender: { $ne: userId }, isRead: false },
        { $set: { isRead: true }, $addToSet: { readBy: userId } }
      );
      socket.to(chatId).emit("messages-read", { chatId, userId });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  });

  socket.on("send-message", async (data) => {
    try {
      const { senderId, chatId, content, file, messageType } = data;

      const message = await new Message({
        sender: senderId,
        chat: chatId,
        content,
        file,
        messageType,
      });
      await message.save();

      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: {
          _id: message._id,
          content: content,
          sender: senderId,
          createdAt: message.createdAt,
        },
      });

      const populatedMessage = await message.populate(
        "sender",
        "username fullName"
      );

      io.to(chatId).emit("receive-message", populatedMessage);
    } catch (err) {
      console.error("❌ Socket error:", err);
    }
  });

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room ${chatId}`);
  });

  // Online user tracking
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("update-online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("update-online-users", Array.from(onlineUsers.keys()));
    console.log("🔴 Client disconnected:", socket.id);
  });

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("video-call", ({ to, offer, from, caller }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-call-offer", { offer, from, caller });
    }
  });

  socket.on("call-rejected", ({ to }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-rejected");
    }
  });

  socket.on("video-answer", ({ to, answer }) => {
    io.to(to).emit("video-call-answer", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("voice-call", ({ to, offer, from, caller }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("voice-call-offer", { offer, from, caller });
    }
  });

  socket.on("voice-answer", ({ to, answer }) => {
    io.to(to).emit("voice-call-answer", { answer });
  });

  socket.on("voice-ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("voice-ice-candidate", { candidate });
  });

  socket.on("voice-call-rejected", ({ to }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("voice-call-rejected");
    }
  });
});

// Connect Mongo and start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
