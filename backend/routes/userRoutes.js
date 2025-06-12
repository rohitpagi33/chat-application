import express from 'express';
import { searchUsers, updateUser, getUserById } from '../controllers/userController.js';

const router = express.Router();

// POST /api/user/search
router.post('/search', searchUsers);
router.get('/:id', getUserById); 
router.put('/:id', updateUser);

export default router;