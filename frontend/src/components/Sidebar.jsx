import React from "react";
import { ListGroup, Badge } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
import { FaFileAlt, FaFileImage } from "react-icons/fa";
// At the top of your file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Sidebar = ({ chats, selectedChat, onSelectChat, userId }) => {
  return (
    <div
      className="flex-grow-1 overflow-auto"
      style={{
        background: "#fafdff",
        //borderRadius: 18,
        boxShadow: "0 4px 18px #1976d211",
        padding: "18px 0 18px 0",
        //margin: "8px",
        minWidth: 280,
        maxWidth: 340,
        scrollbarWidth: "none",
      }}
    >
      <ListGroup
        as="ol"
        className="h-100 rounded-0"
        style={{ maxHeight: "calc(100vh - 36px)", border: "none" }}
      >
        {chats.length === 0 && (
          <div className="p-3 text-center text-muted">No chats yet</div>
        )}
        {chats.map((chat) => {
          const otherUser = chat.users.find((u) => u._id !== userId);
          const chatTitle = chat.isGroupChat
            ? chat.chatName
            : otherUser?.fullName || otherUser?.username;
          let latestMessage = "No messages yet";
          let latestMessageIcon = null;

          const isActive = selectedChat?._id === chat._id;

          if (chat.latestMessage) {
            if (
              chat.latestMessage.messageType === "file" &&
              chat.latestMessage.file
            ) {
              const fileName = chat.latestMessage.file.name || "file";
              if (
                chat.latestMessage.file.type &&
                chat.latestMessage.file.type.startsWith("image/")
              ) {
                latestMessageIcon = (
                  <FaFileImage
                    size={17}
                    color={isActive ? "#1976d2" : "#26a69a"}
                    style={{ marginRight: 6, verticalAlign: "middle" }}
                  />
                );
              } else {
                latestMessageIcon = (
                  <FaFileAlt
                    size={17}
                    color={isActive ? "#1976d2" : "#7e57c2"}
                    style={{ marginRight: 6, verticalAlign: "middle" }}
                  />
                );
              }
              latestMessage = fileName;
            } else if (chat.latestMessage.content) {
              latestMessage = chat.latestMessage.content;
              latestMessageIcon = null;
            }
          }

          return (
            <ListGroup.Item
              as="li"
              key={chat._id}
              action
              active={isActive}
              onClick={() => onSelectChat(chat)}
              className="d-flex justify-content-between align-items-start"
              style={{
                cursor: "pointer",
                background: isActive
                  ? "linear-gradient(90deg, #e3f0fc 60%, #fafdff 100%)"
                  : "#fff",
                border: isActive ? "2px solid #1976d2" : "2px solid #f0f0f0",
                color: isActive ? "#1976d2" : "#222",
                transition: "background 0.2s, border 0.2s",
                //marginBottom: 8,
                //borderRadius: 12,
                boxShadow: isActive
                  ? "0 2px 8px #1976d288"
                  : "0 1px 4px #1976d211",
                padding: "12px 18px",
                minHeight: 68,
                fontFamily: "inherit",
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.background = "#f3f7fb";
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.background = "#fff";
              }}
            >
              <div className="ms-2 me-auto d-flex">
                <div
                  className="d-flex align-items-center"
                  style={{ width: "auto" }}
                >
                  {chat.isGroupChat ? (
                    chat.groupPhoto ? (
                      <img
                        src={chat.groupPhoto}
                        alt="Group"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          marginRight: 14,
                          border: "2px solid #1976d2",
                          boxShadow: "0 2px 8px #1976d288",
                          background: "#fff",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <PersonCircle
                        size={40}
                        className="me-2 text-secondary"
                        style={{ width: "auto" }}
                      />
                    )
                  ) : otherUser?.profilePhoto ? (
                    <img
                      src={otherUser.profilePhoto}
                      alt="Profile"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        marginRight: 14,
                        border: "2px solid #1976d2",
                        boxShadow: "0 2px 8px #1976d288",
                        background: "#fff",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <PersonCircle
                      size={40}
                      className="me-2 text-secondary"
                      style={{ width: "auto" }}
                    />
                  )}
                </div>
                <div>
                  <div className="d-flex align-items-center" style={{ gap: 8 }}>
                    <div
                      className="fw-bold text-truncate"
                      style={{
                        maxWidth: 120,
                        color: isActive ? "#1976d2" : "#222",
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: 0.2,
                      }}
                    >
                      {chatTitle}
                    </div>
                    {chat.latestMessage?.createdAt && (
                      <div
                        style={{
                          fontSize: "0.85em",
                          color: isActive ? "#1976d2" : "#888",
                          textAlign: "right",
                          minWidth: 60,
                          fontWeight: 500,
                        }}
                      >
                        {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                  <div className="d-flex" style={{ gap: 6 }}>
                    <div style={{ maxWidth: 140 }}>
                      <small
                        className="text-truncate d-flex align-items-center"
                        style={{
                          color: isActive ? "#1976d2" : "#888",
                          fontWeight: isActive ? 500 : 400,
                          fontSize: 14,
                          letterSpacing: 0.1,
                          maxWidth: 140,
                        }}
                      >
                        {latestMessageIcon}
                        {latestMessage}
                      </small>
                    </div>
                    <div style={{ minWidth: 30, textAlign: "right" }}>
                      {/* Unread badge */}
                      {chat.unreadCount > 0 && (
                        <Badge
                          bg={isActive ? "primary" : "primary"}
                          pill
                          className="align-self-center ms-2"
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            background: isActive ? "#1976d2" : "#00eaff",
                            color: "#fff",
                            boxShadow: "0 2px 8px #1976d288",
                          }}
                        >
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default Sidebar;
