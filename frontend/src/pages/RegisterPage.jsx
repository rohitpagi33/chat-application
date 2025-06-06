// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../assets/css/styles.css';
import 'remixicon/fonts/remixicon.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async () => {
    try {
      await axios.post('${API_BASE_URL}/api/auth/send-otp', { mobile: form.mobile });
      setMessage('OTP sent to mobile');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyAndRegister = async () => {
    try {
      await axios.post('${API_BASE_URL}/api/auth/register', { ...form, otp });
      setMessage('Registration successful!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        <h1 className="login__title">Register</h1>

        {step === 1 && (
          <>
            <div className="login__content">
              {['fullName', 'username', 'email', 'mobile'].map((field, idx) => (
                <div key={idx} className="login__box">
                  <i className={`ri-${field === 'email' ? 'mail-line' : field === 'mobile' ? 'phone-line' : 'user-line'} login__icon`}></i>
                  <div className="login__box-input">
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      className="login__input"
                      placeholder=" "
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    />
                    <label className="login__label">
                      {field === 'fullName' ? 'Full Name' : field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                  </div>
                </div>
              ))}
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
            <button type="button" className="login__button" onClick={handleVerifyAndRegister}>
              Verify & Register
            </button>
          </>
        )}

        {step === 3 && (
          <p className="login__register">
            Registration complete. You can now <a href="/login">Login</a>.
          </p>
        )}

        {error && <p className="login__register" style={{ color: 'red' }}>{error}</p>}
        {message && <p className="login__register">{message}</p>}
        <p className="login__register">Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
};

export default RegisterPage;
