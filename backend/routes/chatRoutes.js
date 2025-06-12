import express from 'express';
import {
  createChat,
  fetchChat,
  createGroupChat,
  getChatById,
  addMemberToGroup,
  leaveGroupChat,
  removeMemberFromGroup
} from '../controllers/chatController.js';

const router = express.Router();

// Route to create a new chat
router.post('/create', createChat);
router.post('/fetch', fetchChat);
router.post('/group', createGroupChat);
router.post('/add', addMemberToGroup);
router.post('/leave', leaveGroupChat);
router.get('/:id', getChatById);
router.post('/remove-member', removeMemberFromGroup);

export default router;