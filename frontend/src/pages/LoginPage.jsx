
// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../assets/css/styles.css';
import 'remixicon/fonts/remixicon.css';

const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/login-request', { identifier });
      setMessage('OTP sent to your registered mobile');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Login request failed');
    }
  };


const handleVerifyOtp = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login-verify', { identifier, otp });
    login(res.data.user, res.data.token); // Save token
    setMessage('Login successful!');
    navigate('/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Invalid OTP');
  }
};

  return (
    <div className="login">
      <img
        src="https://github.com/bedimcode/animated-login-form/blob/main/assets/img/login-bg.png?raw=true"
        alt="background"
        className="login__img"
      />
      <form className="login__form">
        <h1 className="login__title">Login</h1>

        {step === 1 && (
          <>
            <div className="login__content">
              <div className="login__box">
                <i className="ri-user-line login__icon"></i>
                <div className="login__box-input">
                  <input
                    type="text"
                    className="login__input"
                    placeholder=" "
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <label className="login__label">Username or Mobile</label>
                </div>
              </div>
            </div>

            <button type="button" className="login__button" onClick={handleSendOtp}>
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="login__content">
              <div className="login__box">
                <i className="ri-key-line login__icon"></i>
                <div className="login__box-input">
                  <input
                    type="text"
                    className="login__input"
                    placeholder=" "
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <label className="login__label">Enter OTP</label>
                </div>
              </div>
            </div>

            <button type="button" className="login__button" onClick={handleVerifyOtp}>
              Verify & Login
            </button>
          </>
        )}

        {error && <p className="login__register" style={{ color: 'red' }}>{error}</p>}
        {message && <p className="login__register">{message}</p>}
        <p className="login__register">Don't have an account? <a href="/register">Register</a></p>
      </form>
    </div>
  );
};

export default LoginPage;
