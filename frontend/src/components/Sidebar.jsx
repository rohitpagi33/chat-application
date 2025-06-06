import React from "react";
import { ListGroup, Badge } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
import { FaFileAlt, FaFileImage } from "react-icons/fa";
// At the top of your file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Use it like this:
const res = await axios.post(`${API_BASE_URL}/chat/fetch`, { currentUserId });
const Sidebar = ({ chats, selectedChat, onSelectChat, userId }) => {
  return (
    <div
      className="flex-grow-1 overflow-auto"
      style={{
        scrollbarWidth: "none",
       // paddingTop: 28, // More space before chat list
        paddingBottom: 28, // More space after chat list
      }}
    >
      <ListGroup
        as="ol"
        className="h-100 rounded-0"
        style={{ maxHeight: "100vh" }}
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
                background: isActive ? "#e3f0fc" : "#fff", // Light blue for active
                border: isActive ? "1.5px solid #1976d2" : "1.5px solid #f0f0f0",
                color: isActive ? "#1976d2" : "#222",
                transition: "background 0.2s, border 0.2s",
                // No marginBottom, no borderRadius
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
                          width: 35,
                          height: 35,
                          borderRadius: "50%",
                          marginRight: 12,
                          maxWidth: "35px",
                          border: "1.5px solid #e0e0e0",
                          background: "#fff",
                        }}
                      />
                    ) : (
                      <PersonCircle
                        size={35}
                        className="me-2 text-secondary"
                        style={{ width: "auto" }}
                      />
                    )
                  ) : otherUser?.profilePhoto ? (
                    <img
                      src={otherUser.profilePhoto}
                      alt="Profile"
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: "50%",
                        marginRight: 12,
                        maxWidth: "35px",
                        border: "1.5px solid #e0e0e0",
                        background: "#fff",
                      }}
                    />
                  ) : (
                    <PersonCircle
                      size={35}
                      className="me-2 text-secondary"
                      style={{ width: "auto" }}
                    />
                  )}
                </div>
                <div>
                  <div className="d-flex align-items-center">
                    <div
                      className="fw-bold"
                      style={{
                        width: "60%",
                        color: isActive ? "#1976d2" : "#222",
                      }}
                    >
                      {chatTitle}{" "}
                    </div>
                    {chat.latestMessage?.createdAt && (
                      <div
                        style={{
                          fontSize: "0.8em",
                          color: isActive ? "#1976d2" : "black",
                          textAlign: "right",
                          width: "40%",
                        }}
                      >
                        {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                  <div className="d-flex">
                    <div style={{ width: "70%" }}>
                      <small
                        className="text-truncate d-flex align-items-center"
                        style={{
                          maxWidth: "200px",
                          color: isActive ? "#1976d2" : "#888",
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {latestMessageIcon}
                        {latestMessage}
                      </small>
                    </div>
                    <div style={{ width: "30%", textAlign: "right" }}>
                      {/* Unread badge */}
                      {chat.unreadCount > 0 && (
                        <Badge
                          bg={isActive ? "primary" : "primary"}
                          pill
                          className="align-self-center ms-2"
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
