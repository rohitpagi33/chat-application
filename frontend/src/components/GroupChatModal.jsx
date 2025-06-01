import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, Spinner } from "react-bootstrap";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

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
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton onClick={() => {
      setGroupName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResults([]);
      setGroupPhoto("");
      onClose();
    }}>
        <Modal.Title>Create Group Chat</Modal.Title>
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
            placeholder="Search users by name or username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading && (
            <div className="mt-2 text-center">
              <Spinner animation="border" size="sm" />
            </div>
          )}

          <ListGroup
            style={{ maxHeight: "150px", overflowY: "auto", marginTop: "5px" }}
          >
            {searchResults.map((user) => (
              <ListGroup.Item
                key={user._id}
                action
                onClick={() => toggleSelectUser(user)}
              >
                {user.fullName || user.name} ({user.username})
              </ListGroup.Item>
            ))}
          </ListGroup>

          <div className="mt-2">
            <strong>Selected:</strong>{" "}
            {selectedUsers.map((u) => u.fullName || u.name || u.username).join(", ")}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Group Photo</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setUploading(true);
              const fileExt = file.name.split('.').pop();
              const filePath = `group-${Date.now()}.${fileExt}`;

              // Upload to Supabase
              const { data, error } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

              if (error) {
                alert("Upload failed!");
                setUploading(false);
                return;
              }
              // Get public URL
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
          />
          {uploading && <div>Uploading...</div>}
          {groupPhoto && (
            <img
              src={groupPhoto}
              alt="Group"
              style={{ width: 60, height: 60, borderRadius: "50%", marginTop: 8 }}
            />
          )}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
      setGroupName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResults([]);
      setGroupPhoto("");
      onClose();
    }}>
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
