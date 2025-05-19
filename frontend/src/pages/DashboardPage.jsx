// src/pages/DashboardPage.jsx
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container fluid className="vh-100">
      <Row className="h-100">
        <Col md={4} className="border-end p-0 d-flex flex-column">
          <Sidebar />
          <div className="p-2 border-top text-center">
            <small>Welcome, {user?.fullname || user?.username}</small>
            <Button
              variant="outline-danger"
              size="sm"
              className="mt-2"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Col>
        <Col md={8} className="p-0">
          <ChatWindow />
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
