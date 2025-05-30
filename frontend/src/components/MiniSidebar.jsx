import React, { useState } from "react";
import { FaCog, FaUsers } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import GroupChatModal from "./GroupChatModal";
import axios from "axios";

const MiniSidebar = ({ usersList, onOpenSettings, onGroupCreated }) => {
  const [showGroupModal, setShowGroupModal] = useState(false);

  const buttons = [
    { icon: <FaCog size={20} />, action: onOpenSettings, tooltip: "Settings" },
    {
      icon: <FaUsers size={20} />,
      action: () => setShowGroupModal(true),
      tooltip: "New Group Chat",
    },
  ];

  const handleCreateGroup = async ({ groupName, users }) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const currentUserId = user._id;
      if (!currentUserId) {
        alert("User not logged in");
        return;
      }

      const userIds = users.map((u) => u._id);
      if (!userIds.includes(currentUserId)) {
        userIds.push(currentUserId); // add current user to group if not already included
      }

      const response = await axios.post(
        "http://localhost:5000/api/chat/group",
        {
          chatName: groupName,
          users: userIds,
          isGroupChat: true,
        }
      );
      alert(" created group chat successfully");
    } catch (error) {
      console.error("Group creation failed:", error);
      alert("Failed to create group chat");
    }
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
