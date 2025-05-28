require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(bodyParser.json());


// Import routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));


// Create server for socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io logic
const Message = require('./models/Message');
const Chat = require('./models/Chat');

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('mark-read', async ({ chatId, userId }) => {
    try {
      // Update all messages in the chat not sent by the user, mark as read
      await Message.updateMany(
        { chat: chatId, sender: { $ne: userId }, isRead: false },
        { $set: { isRead: true }, $addToSet: { readBy: userId } }
      );
      // Optionally, emit to other users in the chat
      socket.to(chatId).emit('messages-read', { chatId, userId });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  });

  socket.on('send-message', async (data) => {
    try {
      const { senderId, chatId, content, media, messageType } = data;

      const newMessage = new Message({
        sender: senderId,
        chat: chatId,
        content,
        media,
        messageType: messageType || 'text',
        readBy: [senderId],
      });

      const savedMessage = await newMessage.save();

      // Update latestMessage on chat
      await Chat.findByIdAndUpdate(chatId, { latestMessage: savedMessage._id });

      // Populate sender before emitting
      const populatedMessage = await savedMessage.populate('sender', 'username fullName');

      io.to(chatId).emit('receive-message', populatedMessage);
    } catch (err) {
      console.error('❌ Socket error:', err);
    }
  });

  // Join room for chat messages
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room ${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Connect Mongo and start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
