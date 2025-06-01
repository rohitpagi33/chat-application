import React from "react";
import { ListGroup, Badge } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons"; // <-- Add this line

const Sidebar = ({ chats, selectedChat, onSelectChat, userId }) => {
  return (
    <div
      className="flex-grow-1 overflow-auto"
      style={{
        scrollbarWidth: "none",
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
          if (chat.latestMessage) {
            if (
              chat.latestMessage.messageType === "file" &&
              chat.latestMessage.file
            ) {
              if (
                chat.latestMessage.file.type &&
                chat.latestMessage.file.type.startsWith("image/")
              ) {
                latestMessage = "Sent you an image";
              } else {
                latestMessage = "Sent you a file";
              }
            } else if (chat.latestMessage.content) {
              latestMessage = chat.latestMessage.content;
            }
          }

          return (
            <ListGroup.Item
              as="li"
              key={chat._id}
              action
              active={selectedChat?._id === chat._id}
              onClick={() => onSelectChat(chat)}
              className="d-flex justify-content-between align-items-start"
              style={{ cursor: "pointer" }}
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
                          marginRight: 12, // slightly more margin for spacing
                          border: "1.5px solid #e0e0e0", // subtle border
                          objectFit: "cover", // ensures the image fills the circle nicely
                          background: "#fff", // fallback background
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
                        border: "1.5px solid #e0e0e0",
                        objectFit: "cover",
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
                    <div className="fw-bold" style={{ width: "60%" }}>
                      {chatTitle}{" "}
                    </div>
                    {chat.latestMessage?.createdAt && (
                      <div
                        className=""
                        style={{
                          fontSize: "0.8em",
                          color: "black",
                          textAlign: "right",
                          width: "40%",
                        }}
                      >
                        {new Date(
                          chat.latestMessage.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                  <div className="d-flex">
                    <div className="" style={{ width: "70%" }}>
                      <small
                        className="text-muted text-truncate d-block"
                        style={{ maxWidth: "200px" }}
                      >
                        {latestMessage}
                      </small>
                    </div>
                    <div
                      className=""
                      style={{ width: "30%", textAlign: "right" }}
                    >
                      {/* Unread badge */}
                      {chat.unreadCount > 0 && (
                        <Badge
                          bg="primary"
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
