import React from "react";
import { ListGroup } from "react-bootstrap";
import { Check, CheckAll } from "react-bootstrap-icons";

const Message = ({ msg, userId, onContextMenu, renderFile, isGroupChat }) => {
  const canDelete =
    msg.sender._id === userId &&
    new Date() - new Date(msg.createdAt) < 2 * 60 * 1000;

  const isOwnMessage = msg.sender._id === userId;

  return (
    <ListGroup.Item
      className={`mb-2 rounded shadow-sm px-3 py-2 ${
        isOwnMessage ? "bg-primary text-white ms-auto" : "bg-light me-auto"
      }`}
      style={{
        maxWidth: "75%",
        transition: "all 0.3s ease",
        background: isOwnMessage ? "#1976d2" : "#f5f7fa",
        color: isOwnMessage ? "#fff" : "#222",
        borderRadius: "18px",
        padding: "10px 18px",
        fontSize: "1rem",
        fontWeight: 500,
        boxShadow: isOwnMessage ? "0 2px 8px #1976d244" : "none",
        wordBreak: "break-word",
        alignSelf: isOwnMessage ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
      onContextMenu={(e) => onContextMenu(e, msg)}
      title={canDelete ? "Right-click to delete (within 2 minutes)" : undefined}
    >
      {/* Only show sender name in group chat */}
      {isGroupChat && (
        <div className="small fw-bold mb-1">
          {msg.sender.fullName || msg.sender.username}
        </div>
      )}
      <div
        className="d-flex flex-row justify-content-end align-items-center mt-2"
        style={{ fontSize: "0.95rem" }}
      >
        <div className="d-flex">
          {msg.file && msg.file.url && renderFile(msg.file)}
          {msg.content && <div>{msg.content}</div>}
        </div>
        <div
          className="d-flex flex-row align-items-center gap-0"
          style={{ width: "20%", gap: "2px" }}
        >
          <span className="text-dark me-1" style={{ textAlign: "right" }}>
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {msg.sender._id === userId && (
            <span
              className="text-light"
              style={{ textAlign: "right", width: "20px" }}
            >
              {msg.isRead ? <CheckAll size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </ListGroup.Item>
  );
};

export default Message;
