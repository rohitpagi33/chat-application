import React from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import Message from "./Message";

const MessageList = ({
  messages,
  loading,
  userId,
  onContextMenu,
  messagesEndRef,
  formatDate,
  renderFile,
  contextMenu,
  handleDeleteMessage,
  setContextMenu,
}) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" style={{color: 'blue'}} />
      </div>
    );
  }

  return (
    <>
      <ListGroup variant="flush">
        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const showDate =
            !prevMsg ||
            new Date(prevMsg.createdAt).toDateString() !==
              new Date(msg.createdAt).toDateString();

          return (
            <React.Fragment key={msg._id}>
              {showDate && (
                <div
                  className="mx-auto text-center text-muted sticky-top mb-2 p-2"
                  style={{
                    minWidth: "200px",
                    backgroundColor: "rgb(240, 242, 245)",
                  }}
                >
                  <span
                    className="mx-auto p-2 mb-2"
                    style={{
                      fontSize: "0.85rem",
                      borderRadius: "8px",
                      backgroundColor: "rgb(210, 216, 223)",
                    }}
                  >
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              )}
              <Message
                msg={msg}
                userId={userId}
                onContextMenu={onContextMenu}
                renderFile={renderFile}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </ListGroup>
      {/* Custom context menu */}
      {contextMenu.visible && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            width: "auto",
            padding: "4px 0",
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              color: "red",
              fontWeight: 500,
            }}
            onClick={() => {
              handleDeleteMessage(contextMenu.msgId);
              setContextMenu({ visible: false, x: 0, y: 0, msgId: null });
            }}
          >
            Delete
          </div>
        </div>
      )}
    </>
  );
};

export default MessageList;