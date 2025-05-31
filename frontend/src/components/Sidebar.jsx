import React from "react";
import { ListGroup, Badge } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons"; // <-- Add this line

const Sidebar = ({ chats, selectedChat, onSelectChat, userId }) => {
  return (
    <div className="flex-grow-1 overflow-auto"
    style={{
          scrollbarWidth: "none",
        }}>
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
          const latestMessage =
            chat.latestMessage?.content || "No messages yet";

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
                  <PersonCircle
                    size={30}
                    className="me-2  text-secondary"
                    style={{ width: "auto" }}
                  ></PersonCircle>
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
