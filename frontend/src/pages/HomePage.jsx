// src/pages/HomePage.js
import React from 'react';
import '../assets/css/styles.css';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => (
  <Container className="mt-4 text-center">
    <h2>Welcome to LoginApp</h2>
    <p>Please register or log in to continue.</p>

    <div className="mt-3">
      <Link to="/register">
        <Button variant="primary" className="mb-2">Register</Button>
      </Link>
      <Link to="/login">
        <Button variant="secondary">Login</Button>
      </Link>
    </div>
  </Container>
);

export default HomePage;
