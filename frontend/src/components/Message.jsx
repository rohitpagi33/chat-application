import React from "react";
import { ListGroup } from "react-bootstrap";
import { Check, CheckAll } from "react-bootstrap-icons";

const Message = ({ msg, userId, onContextMenu, renderFile }) => {
  const canDelete =
    msg.sender._id === userId &&
    new Date() - new Date(msg.createdAt) < 2 * 60 * 1000;

  return (
    <ListGroup.Item
      className={`mb-2 rounded shadow-sm px-3 py-2 ${
        msg.sender._id === userId
          ? "bg-primary text-white ms-auto"
          : "bg-light me-auto"
      }`}
      style={{ maxWidth: "70%", transition: "all 0.3s ease" }}
      onContextMenu={(e) => onContextMenu(e, msg)}
      title={canDelete ? "Right-click to delete (within 2 minutes)" : undefined}
    >
      <div className="small fw-bold">
        {msg.sender.fullName || msg.sender.username}
      </div>
      <div
        className="d-flex flex-row justify-content-end align-items-center mt-2"
        style={{ fontSize: "0.75rem" }}
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
