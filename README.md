# MERN Realtime Chat Application 💬

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen?logo=mongodb)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socket.io)](https://socket.io/)

A modern real-time chat application built with the **MERN** stack — MongoDB, Express, React, and Node.js. Inspired by WhatsApp, this app supports real-time messaging, user authentication, and group chat creation.

---

## 🚧 Project Status

**In active development.**  
Core structure is in place. The team is working on:
- Connecting backend APIs to the frontend
- Implementing real-time messaging with WebSockets
- Building a clean, responsive UI

---

## ⚙️ Tech Stack

- **Frontend:** React, Bootstrap, React-Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** OTP-based login (Twilio), JWT for session handling
- **Real-time:** Socket.IO

---

## ✨ Features

- [x] User registration and OTP login
- [x] JWT-based authentication and protected routes
- [x] View existing chats and send messages
- [x] Start new chats with other users
- [x] Real-time messaging via WebSockets
- [x] Group chat support
- [x] Message read receipts & online status
- [ ] Responsive mobile-first UI

---

## 🚀 Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/rohitpagi33/chat-application
cd chat-application
```

### 2. **Install dependencies**

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. **Configure environment variables**

- Copy `.env.example` to `.env` in both `backend` and `frontend` folders.
- Update with your credentials (MongoDB URI, JWT secret, Twilio, etc).

### 4. **Start the servers**

```bash
# In one terminal
cd backend
npm start

# In another terminal
cd frontend
npm start
```

---

## 📄 Notes

- **API Base URL:**  
  The frontend uses an environment variable (`VITE_API_BASE_URL`) for API endpoints.  
  Change it in `frontend/.env` to switch environments easily.

- **Frontend:** Runs on [http://localhost:5173](http://localhost:5137)  
- **Backend:** Runs on [http://localhost:5000](http://localhost:5000)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License

This project is [MIT](LICENSE) licensed.

---
