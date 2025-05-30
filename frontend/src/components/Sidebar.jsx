import React from "react";
import { ListGroup, Badge } from "react-bootstrap";

const Sidebar = ({ chats, selectedChat, onSelectChat, userId }) => {
  return (
    <div className="flex-grow-1 overflow-auto">
      <ListGroup as="ol" className="h-100">
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
              <div className="ms-2 me-auto">
                <div className="d-flex">
                  <div className="fw-bold" style={{width: "60%"}}>{chatTitle}{" "}</div>
                  {chat.latestMessage?.createdAt && (
                    <div className="ms-3" style={{ fontSize: "0.8em", color: "black", textAlign: "right", width: "40%" }}>
                      {new Date(
                        chat.latestMessage.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
                <small
                  className="text-muted text-truncate d-block"
                  style={{ maxWidth: "200px" }}
                >
                  {latestMessage}
                </small>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default Sidebar;
