// components/Message.js
import React from "react";
import { ListGroup } from "react-bootstrap";
import { Check, CheckAll } from "react-bootstrap-icons";

const Message = ({ msg, userId, prevMsg, onContextMenu }) => {
  const showDate =
    !prevMsg ||
    new Date(prevMsg.createdAt).toDateString() !==
      new Date(msg.createdAt).toDateString();

  const canDelete =
    msg.sender._id === userId &&
    new Date() - new Date(msg.createdAt) < 2 * 60 * 1000;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)
      return date.toLocaleDateString(undefined, { weekday: "long" });
    return date.getFullYear() === now.getFullYear()
      ? date.toLocaleDateString(undefined, { day: "numeric", month: "long" })
      : date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  return (
    <>
      {showDate && (
        <div
          className="mx-auto text-center text-muted sticky-top mb-2 p-2"
          style={{ minWidth: "200px", backgroundColor: "#f0f2f5" }}
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

      <ListGroup.Item
        className={`mb-2 rounded shadow-sm px-3 py-2 ${
          msg.sender._id === userId
            ? "bg-primary text-white ms-auto"
            : "bg-light me-auto"
        }`}
        style={{ maxWidth: "60%", transition: "all 0.3s ease" }}
        onContextMenu={(e) => onContextMenu(e, msg)}
        title={
          canDelete ? "Right-click to delete (within 2 minutes)" : undefined
        }
      >
        <div className="small fw-bold">
          {msg.sender.fullName || msg.sender.username}
        </div>
        <div className="d-flex">
          <div>{msg.content}</div>
          <div
            className="d-flex justify-content-end align-items-center mt-2"
            style={{ fontSize: "0.75rem", textAlign: "right", width: "30%" }}
          >
            <span className="text-dark" style={{width: "auto"}}>
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {msg.sender._id === userId && (
              <span className="text-light ms-2"  style={{width: "20px"}}>
                {msg.isRead ? <CheckAll size={14} /> : <Check size={14} />}
              </span>
            )}
          </div>
        </div>
      </ListGroup.Item>
    </>
  );
};

export default Message;
