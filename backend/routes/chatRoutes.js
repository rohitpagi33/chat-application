const express = require('express');
const router = express.Router();
const { createChat } = require('../controllers/chatController');
const { fetchChat } = require('../controllers/chatController');
const { createGroupChat } = require("../controllers/chatController");
const { getChatById } = require('../controllers/chatController');
const { addMemberToGroup } = require('../controllers/chatController');
const { leaveGroupChat } = require('../controllers/chatController');
const { removeMemberFromGroup } = require('../controllers/chatController');

// Route to create a new chat
router.post('/create', createChat);
router.post('/fetch', fetchChat);
router.post("/group", createGroupChat);
router.post('/add', addMemberToGroup);
router.post('/leave', leaveGroupChat);
router.get('/:id', getChatById);
router.post("/remove-member", removeMemberFromGroup);

module.exports = router;
