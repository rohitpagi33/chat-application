import React from "react";
import { FaCog, FaUsers } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const MiniSidebar = ({ onOpenSettings, onCreateGroup }) => {
  const buttons = [
    { icon: <FaCog size={20} />, action: onOpenSettings, tooltip: "Settings" },
    { icon: <FaUsers size={20} />, action: onCreateGroup, tooltip: "New Group Chat" },
  ];

  return (
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
  );
};

export default MiniSidebar;
