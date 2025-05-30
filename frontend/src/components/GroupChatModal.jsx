import React, { useState } from "react";
import { Modal, Button, Form, ListGroup } from "react-bootstrap";

const GroupChatModal = ({ show, onClose, onCreateGroup, usersList = [] }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");

  const filteredUsers = search
    ? usersList.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) &&
          !selectedUsers.some((u) => u._id === user._id)
      )
    : [];

  const toggleSelectUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Please enter a group name and select at least one user");
      return;
    }
    onCreateGroup({ groupName, users: selectedUsers });
    setGroupName("");
    setSelectedUsers([]);
    setSearch("");
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Group Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Group Chat Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter group chat name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Add Members</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ListGroup
            style={{ maxHeight: "150px", overflowY: "auto", marginTop: "5px" }}
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <ListGroup.Item
                  key={user._id}
                  action
                  onClick={() => toggleSelectUser(user)}
                >
                  {user.name}
                </ListGroup.Item>
              ))
            ) : search ? (
              <div className="text-muted p-2">No users found</div>
            ) : null}
          </ListGroup>
          <div className="mt-2">
            <strong>Selected:</strong> {selectedUsers.map((u) => u.name).join(", ")}
          </div>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCreate}>
          Create Group
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupChatModal;
