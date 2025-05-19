import React from 'react';
import { ListGroup, Image } from 'react-bootstrap';

const ChatListItem = ({ chat }) => {
  return (
    <ListGroup.Item action className="d-flex align-items-center px-3 py-2">
      <Image
        src="https://via.placeholder.com/40"
        roundedCircle
        className="me-2"
      />
      <div>
        <div className="fw-bold">{chat.name}</div>
        <div className="text-muted small">{chat.lastMessage}</div>
      </div>
    </ListGroup.Item>
  );
};

export default ChatListItem;
