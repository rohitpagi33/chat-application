import express from 'express';
import { sendOTP, registerUser, loginRequest, verifyLoginOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOTP);             // For registration
router.post('/register', registerUser);        // Registration after OTP

router.post('/login-request', loginRequest);   // Login: send OTP
router.post('/login-verify', verifyLoginOTP);  // Login: verify OTP

export default router;