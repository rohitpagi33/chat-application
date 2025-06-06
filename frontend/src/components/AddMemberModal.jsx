import React, { useState, useEffect } from "react";
import { Modal, Form, Button, ListGroup, Spinner } from "react-bootstrap";
import axios from "axios";
// At the top of your file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddMemberModal = ({ show, onHide, chatId, currentMembers, onMembersAdded }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!search) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      axios
        .post(`${API_BASE_URL}/api/user/search`, { search })
        .then(res => {
          setResults(res.data.filter(u => !currentMembers.some(m => m._id === u._id)));
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400); // 400ms debounce

    return () => clearTimeout(timeout);
  }, [search, currentMembers]);

  const handleAdd = async (userId) => {
    setAdding(true);
    try {
      await axios.post(`${API_BASE_URL}/api/chat/add`, { chatId, userId });
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
          }}
        >
          <Form.Control
            type="text"
            placeholder="Search users by name or username"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-2"
          />
          {loading && <Spinner size="sm" animation="border" />}
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