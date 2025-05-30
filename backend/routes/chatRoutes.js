const express = require('express');
const router = express.Router();
const { createChat } = require('../controllers/chatController');
const { fetchChat } = require('../controllers/chatController');
const { createGroupChat } = require("../controllers/chatController");

// Route to create a new chat
router.post('/create', createChat);
router.post('/fetch', fetchChat);
router.post("/group", createGroupChat);

module.exports = router;
