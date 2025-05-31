// components/MessageList.js
import React from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import Message from "./Message";

const MessageList = ({ messages, loading, userId, onContextMenu, messagesEndRef }) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" style={{ color: "#ff6600" }} />
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {messages.map((msg, idx) => (
        <Message
          key={msg._id}
          msg={msg}
          userId={userId}
          prevMsg={messages[idx - 1]}
          onContextMenu={onContextMenu}
        />
      ))}
      <div ref={messagesEndRef} />
    </ListGroup>
  );
};

export default MessageList;
