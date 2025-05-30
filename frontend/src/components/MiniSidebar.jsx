import React, { useState } from "react";
import { FaCog, FaUsers } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import GroupChatModal from "./GroupChatModal";

const MiniSidebar = ({ usersList, onOpenSettings, onGroupCreated }) => {
  const [showGroupModal, setShowGroupModal] = useState(false);

  const buttons = [
    { icon: <FaCog size={20} />, action: onOpenSettings, tooltip: "Settings" },
    { icon: <FaUsers size={20} />, action: () => setShowGroupModal(true), tooltip: "New Group Chat" },
  ];

  const handleCreateGroup = ({ groupName, users }) => {
    // Prepare the payload for backend
    // Include current logged-in user ID too if necessary
    // Example:
    const userIds = users.map(u => u._id);
    // Then call your API to create group chat
    fetch("/api/chats/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatName: groupName, users: userIds, isGroupChat: true }),
    })
      .then(res => res.json())
      .then(data => {
        onGroupCreated(data); // Notify parent about new group chat created
      })
      .catch(err => {
        console.error(err);
        alert("Failed to create group chat");
      });
  };

  return (
    <>
      <div className="d-flex flex-column align-items-center py-3 h-100">
        {buttons.map((btn, idx) => (
          <OverlayTrigger
            key={idx}
            placement="right"
            overlay={<Tooltip>{btn.tooltip}</Tooltip>}
          >
            <div
              className="mb-3 p-2 rounded text-black hover-bg"
              role="button"
              onClick={btn.action}
            >
              {btn.icon}
            </div>
          </OverlayTrigger>
        ))}
      </div>

      <GroupChatModal
        show={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onCreateGroup={handleCreateGroup}
        usersList={usersList}
      />
    </>
  );
};

export default MiniSidebar;
