import React from "react";
import { Modal } from "react-bootstrap";
const GroupChatSettings = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Group Settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {/* Add settings here later */}
      <div className="text-muted">Settings coming soon...</div>
    </Modal.Body>
  </Modal>
);
export default GroupChatSettings;
