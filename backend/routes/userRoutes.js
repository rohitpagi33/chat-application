// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/userController');

// POST /api/user/search
router.post('/search', searchUsers);

module.exports = router;
