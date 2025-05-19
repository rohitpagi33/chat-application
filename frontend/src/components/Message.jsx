import React from 'react';
import { Card } from 'react-bootstrap';
import classNames from 'classnames';

const Message = ({ sender, text }) => {
  const isMe = sender === 'Me';

  return (
    <div className={classNames('d-flex', {
      'justify-content-end': isMe,
      'justify-content-start': !isMe
    })}>
      <Card
        bg={isMe ? 'primary' : 'light'}
        text={isMe ? 'white' : 'dark'}
        className="mb-2 px-3 py-2"
        style={{ maxWidth: '75%' }}
      >
        <span>{text}</span>
      </Card>
    </div>
  );
};

export default Message;
