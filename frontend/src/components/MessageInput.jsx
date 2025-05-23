import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="d-flex mt-2">
      <Form.Control
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button type="submit" className="ms-2">Send</Button>
    </Form>
  );
};

export default MessageInput;
