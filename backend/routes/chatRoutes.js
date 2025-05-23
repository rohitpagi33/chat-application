const express = require('express');
const router = express.Router();
const { createOrGetDirectChat } = require('../controllers/chatController');

router.post('/create', createOrGetDirectChat);

module.exports = router;
