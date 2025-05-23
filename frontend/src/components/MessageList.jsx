import React from 'react';

const MessageList = ({ messages, currentUser }) => {
  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={msg.sender === currentUser._id ? 'my-message' : 'their-message'}
        >
          <p>{msg.content}</p>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
