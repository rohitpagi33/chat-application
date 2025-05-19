import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ListGroup, Form, InputGroup, Image } from 'react-bootstrap';
import ChatListItem from './ChatListItem';

const Sidebar = () => {
  const { user } = useAuth();

  // Dummy chat data
  const chats = [
    { id: 1, name: 'John Doe', lastMessage: 'Hey! How are you?' },
    { id: 2, name: 'Jane Smith', lastMessage: 'See you tomorrow.' },
    { id: 3, name: 'Group Chat', lastMessage: 'You: Let’s meet at 7' }
  ];

  return (
    <div className="d-flex flex-column h-100">
      {/* User Profile */}
      <div className="p-3 border-bottom bg-light d-flex align-items-center">
        <Image
          src="https://via.placeholder.com/40"
          roundedCircle
          className="me-2"
        />
        <div>
          <strong>{user?.fullname || user?.username}</strong>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-bottom">
        <InputGroup size="sm">
          <Form.Control placeholder="Search chats..." />
        </InputGroup>
      </div>

      {/* Chat List */}
      <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
        {chats.map((chat) => (
          <ChatListItem key={chat.id} chat={chat} />
        ))}
      </ListGroup>
    </div>
  );
};

export default Sidebar;
