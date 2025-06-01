import React, { useState } from "react";
import { Modal, Form, Button, ListGroup, Spinner } from "react-bootstrap";
import axios from "axios";
const AddMemberModal = ({ show, onHide, chatId, currentMembers, onMembersAdded }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/user/search", { search });
      // Exclude already added members
      setResults(res.data.filter(u => !currentMembers.some(m => m._id === u._id)));
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleAdd = async (userId) => {
    setAdding(true);
    try {
      await axios.post("http://localhost:5000/api/chat/add", { chatId, userId }); // <-- send both in body
      onMembersAdded();
      onHide();
    } catch {
      alert("Failed to add member");
    }
    setAdding(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Member</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Form.Control
            type="text"
            placeholder="Search users by name or username"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-2"
          />
          <Button type="submit" variant="primary" disabled={loading || !search}>
            {loading ? <Spinner size="sm" animation="border" /> : "Search"}
          </Button>
        </Form>
        <ListGroup className="mt-3">
          {results.map(user => (
            <ListGroup.Item
              key={user._id}
              className="d-flex align-items-center justify-content-between"
            >
              <span>
                {user.fullName || user.username}
              </span>
              <Button
                size="sm"
                variant="success"
                disabled={adding}
                onClick={() => handleAdd(user._id)}
              >
                Add
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};
export default AddMemberModal;
