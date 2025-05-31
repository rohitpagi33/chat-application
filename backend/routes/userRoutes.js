// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { searchUsers, updateUser, getUserById } = require('../controllers/userController');

// POST /api/user/search
router.post('/search', searchUsers);
router.get('/:id', getUserById); 
router.put('/:id', updateUser);

module.exports = router;
