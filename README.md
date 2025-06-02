# MERN Realtime Chat Application 💬

A modern real-time chat application built using the **MERN** stack — MongoDB, Express, React, and Node.js. Inspired by WhatsApp, this app supports real-time messaging, user authentication, and chat creation between users.

## 🚧 Project Status

This project is currently under active development. The core structure is in place, and the team is working on connecting backend APIs to the frontend, implementing real-time messaging with WebSockets, and building a clean, responsive UI.

## ⚙️ Tech Stack

- **Frontend:** React, Bootstrap, React-Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** OTP-based login (Twilio), JWT for session handling
- **Real-time:** Socket.IO

## 📁 Features (In Progress)

- [x] User registration and OTP login
- [x] JWT-based authentication and protected routes
- [x] View existing chats and send messages
- [x] Start new chats with other users
- [x] Real-time messaging via WebSockets
- [x] Group chat support
- [x] Message read receipts & online status
- [ ] Responsive mobile-first UI

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rohitpagi33/chat-application
cd mern-chat-application
```

### 2. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure environment variables

- Copy `.env.example` to `.env` in both `backend` and `frontend` folders and update with your credentials (MongoDB URI, JWT secret, Twilio, etc).

### 4. Start the servers

```bash
# In one terminal
cd backend
npm start

# In another terminal
cd frontend
npm start
```