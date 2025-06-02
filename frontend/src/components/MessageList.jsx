import React, { useRef, useEffect, useState } from "react";
import { ListGroup, Spinner, Button } from "react-bootstrap";
import Message from "./Message";
import { ChevronDoubleDown } from "react-bootstrap-icons";

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
  const listRef = useRef();
  const [showScrollDown, setShowScrollDown] = useState(false);

  useEffect(() => {
    // Hide scroll button when new messages arrive
    setShowScrollDown(false);
    // Optionally scroll to bottom on new messages
    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show button if not at the very bottom
  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 1);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollDown(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" style={{ color: "blue" }} />
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      style={{ height: "100%", overflowY: "auto", position: "relative" }}
    >
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
      {/* Small scroll to bottom button */}
      {showScrollDown && (
        <Button
          variant="light"
          size="sm"
          onClick={scrollToBottom}
          style={{
            position: "fixed", // <-- fixed, not absolute
            bottom: 110,        // adjust as needed
            right: 50,         // adjust as needed
            zIndex: 1000,      // high z-index so it's always on top
            borderRadius: "50%",
            width: 36,
            height: 36,
            minWidth: 36,
            minHeight: 36,
            padding: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            opacity: 0.85,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.3s",
          }}
          aria-label="Scroll to latest message"
        >
          <ChevronDoubleDown size={20} />
        </Button>
      )}
    </div>
  );
};

export default MessageList;