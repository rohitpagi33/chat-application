// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  sendOTP,
  registerUser,
  loginRequest,
  verifyLoginOTP
} = require('../controllers/authController');

router.post('/send-otp', sendOTP);             // For registration
router.post('/register', registerUser);        // Registration after OTP

router.post('/login-request', loginRequest);   // Login: send OTP
router.post('/login-verify', verifyLoginOTP);  // Login: verify OTP

module.exports = router;
