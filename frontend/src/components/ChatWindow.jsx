import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import TopBar from './TopBar';
import Message from './Message';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'John', text: 'Hey there!' },
    { id: 2, sender: 'Me', text: 'Hi! How are you?' },
    { id: 3, sender: 'John', text: 'Doing well, thanks.' }
  ]);

  const handleSendMessage = (text) => {
    if (text.trim() !== '') {
      setMessages([...messages, { id: Date.now(), sender: 'Me', text }]);
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      <TopBar name="John Doe" />
      <Container fluid className="flex-grow-1 overflow-auto px-3 py-2">
        {messages.map((msg) => (
          <Message key={msg.id} sender={msg.sender} text={msg.text} />
        ))}
      </Container>
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
