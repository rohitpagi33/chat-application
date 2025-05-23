import React from 'react';
import { ListGroup } from 'react-bootstrap';

const Sidebar = ({ chats, selectedChat, onSelectChat, userId }) => {
  return (
    <div className="flex-grow-1 overflow-auto">
      <ListGroup variant="flush">
        {chats.length === 0 && (
          <div className="p-3 text-center text-muted">No chats yet</div>
        )}
        {chats.map(chat => {
          const otherUser = chat.users.find(u => u._id !== userId);
          return (
            <ListGroup.Item
              key={chat._id}
              action
              active={selectedChat?._id === chat._id}
              onClick={() => onSelectChat(chat)}
            >
              {chat.isGroupChat ? chat.chatName : otherUser?.fullName || otherUser?.username}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default Sidebar;
