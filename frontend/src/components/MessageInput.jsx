import React, { useState } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() !== '') {
      onSend(text);
      setText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="p-2 border-top">
      <InputGroup>
        <FormControl
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button variant="primary" onClick={handleSend}>
          Send
        </Button>
      </InputGroup>
    </div>
  );
};

export default MessageInput;
