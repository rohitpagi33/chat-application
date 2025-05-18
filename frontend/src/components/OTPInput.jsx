// src/components/OTPInput.js
import React from 'react';
import { Form } from 'react-bootstrap';

const OTPInput = ({ otp, setOtp }) => (
  <Form.Group>
    <Form.Label>Enter OTP</Form.Label>
    <Form.Control
      type="text"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      maxLength="6"
      placeholder="Enter the 6-digit OTP"
    />
  </Form.Group>
);

export default OTPInput;
