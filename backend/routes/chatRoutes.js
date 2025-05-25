const express = require('express');
const router = express.Router();
const { createChat } = require('../controllers/chatController');

// Route to create a new chat
router.post('/create', createChat);

module.exports = router;
