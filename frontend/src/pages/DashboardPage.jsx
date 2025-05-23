import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const DashboardPage = () => {
  const userId = localStorage.getItem('userId'); // get logged in userId from localStorage
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat?userId=${userId}`);
      setChats(res.data);
    } catch (err) {
      console.error('Failed to fetch chats', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleStartNewChat = (chat) => {
    setChats(prev => [chat, ...prev]);
    setSelectedChat(chat);
  };

  return (
    <Container fluid className="vh-100">
      <Row className="h-100">
        <Col md={4} className="border-end p-0 d-flex flex-column">
          <Sidebar
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            userId={userId}
          />
        </Col>
        <Col md={8} className="p-0">
          <ChatWindow
            chat={selectedChat}
            userId={userId}
            onStartNewChat={handleStartNewChat}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
