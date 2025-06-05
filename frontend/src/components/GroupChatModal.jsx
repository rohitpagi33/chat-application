import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, Spinner } from "react-bootstrap";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { FaEdit } from "react-icons/fa";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const GroupChatModal = ({ show, onClose, onCreateGroup, currentUserId }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupPhoto, setGroupPhoto] = useState("");
  const [uploading, setUploading] = useState(false);

  // Perform live search on search input change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim()) {
        handleSearch(search.trim());
      } else {
        setSearchResults([]);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSearch = async (searchTerm) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/user/search",
        { search: searchTerm }
      );
      // Filter out current user and already selected users
      const filtered = res.data.filter(
        (u) => u._id !== currentUserId && !selectedUsers.some((sel) => sel._id === u._id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("User search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
      // Optionally remove from search results on select
      setSearchResults(searchResults.filter((u) => u._id !== user._id));
    }
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Please enter a group name and select at least one user");
      return;
    }
    onCreateGroup({ groupName, users: selectedUsers, groupPhoto });
    setGroupName("");
    setSelectedUsers([]);
    setSearch("");
    setSearchResults([]);
    setGroupPhoto("");
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header
        closeButton
        style={{
          borderBottom: "none",
          background: "#f7fafd",
          fontFamily: "inherit",
        }}
      >
        <Modal.Title style={{ fontWeight: 700, color: "#1976d2", letterSpacing: 1, fontSize: 22 }}>
          Create Group Chat
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#f7fafd", fontFamily: "inherit" }}>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, color: "#1976d2" }}>Group Chat Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter group chat name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1.5px solid #c7e0fa",
              fontSize: 16,
              fontWeight: 500,
              background: "#fafdff",
              boxShadow: "0 1px 4px #1976d211",
              marginBottom: 4,
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, color: "#1976d2" }}>Add Members</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search users by name or username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              borderRadius: 8,
              border: "1.5px solid #c7e0fa",
              fontSize: 15,
              background: "#fafdff",
              boxShadow: "0 1px 4px #1976d211",
            }}
          />

          {loading && (
            <div className="mt-2 text-center">
              <Spinner animation="border" size="sm" />
            </div>
          )}

          <ListGroup
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              marginTop: "5px",
              borderRadius: 8,
              boxShadow: "0 1px 4px #1976d211",
              fontSize: 15,
            }}
          >
            {searchResults.map((user) => (
              <ListGroup.Item
                key={user._id}
                action
                onClick={() => toggleSelectUser(user)}
                style={{
                  border: "none",
                  borderRadius: 6,
                  marginBottom: 2,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {user.fullName || user.name} ({user.username})
              </ListGroup.Item>
            ))}
          </ListGroup>

          <div className="mt-2" style={{ fontSize: 15 }}>
            <strong>Selected:</strong>{" "}
            {selectedUsers.map((u) => u.fullName || u.name || u.username).join(", ")}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, color: "#1976d2" }}>Group Photo</Form.Label>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label
              htmlFor="group-photo-input"
              style={{
                background: "linear-gradient(90deg, #1976d2 60%, #00eaff 100%)",
                color: "#fff",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px #1976d288",
                border: "2px solid #fff",
                position: "relative",
              }}
              title="Choose group photo"
            >
              <FaEdit size={17} />
              <input
                id="group-photo-input"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setUploading(true);
                  const fileExt = file.name.split('.').pop();
                  const filePath = `group-${Date.now()}.${fileExt}`;
                  const { data, error } = await supabase.storage
                    .from("avatars")
                    .upload(filePath, file);
                  if (error) {
                    alert("Upload failed!");
                    setUploading(false);
                    return;
                  }
                  const { data: urlData, error: urlError } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(filePath);
                  if (urlError) {
                    alert("Failed to get public URL!");
                    setUploading(false);
                    return;
                  }
                  setGroupPhoto(urlData.publicUrl);
                  setUploading(false);
                }}
                disabled={uploading}
                style={{
                  opacity: 0,
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              />
            </label>
            {uploading && <div style={{ fontSize: 14, color: "#888" }}>Uploading...</div>}
            {groupPhoto && (
              <img
                src={groupPhoto}
                alt="Group"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  marginTop: 0,
                  border: "2px solid #1976d2",
                  boxShadow: "0 2px 8px #1976d288",
                  objectFit: "cover",
                }}
              />
            )}
          </div>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer style={{ background: "#f7fafd", borderTop: "none" }}>
        <Button
          variant="secondary"
          onClick={() => {
            setGroupName("");
            setSelectedUsers([]);
            setSearch("");
            setSearchResults([]);
            setGroupPhoto("");
            onClose();
          }}
          style={{
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 15,
            padding: "8px 18px",
            background: "#e0e0e0",
            color: "#1976d2",
            border: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreate}
          style={{
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 15,
            padding: "8px 18px",
            background: "linear-gradient(90deg, #1976d2 60%, #00eaff 100%)",
            border: "none",
            boxShadow: "0 2px 8px #1976d288",
          }}
        >
          Create Group
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupChatModal;
