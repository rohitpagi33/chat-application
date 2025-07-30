import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaEdit, FaSave, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// At the top of your file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Settings = ({ onBack, onGoToChat, onLogout }) => {
  const { user, updateUser } = useAuth();
  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }
  const currentUserId = user._id;

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    username: "",
    profilePhoto: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [originalUserData, setOriginalUserData] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchGroups();
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/user/${currentUserId}`
      );
      setUserData(res.data);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat/fetch`, {
        currentUserId,
      });
      // Only group chats
      setMyGroups(res.data.filter((chat) => chat.isGroupChat));
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${currentUserId}.${fileExt}`; // Only user ID

    // Delete the old file if it exists
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([filePath]);
    if (deleteError && deleteError.message !== "Object not found") {
      console.log("Supabase delete error:", deleteError);
      alert("Failed to delete old profile photo!");
      setUploading(false);
      return;
    }

    // Upload the new file (upsert is optional now)
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);
    if (error) {
      console.log("Supabase upload error:", error);
      alert("Upload failed!");
      setUploading(false);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    setUserData({ ...userData, profilePhoto: publicUrlData.publicUrl });
    setUploading(false);
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/user/${user._id}`, {
        fullName: userData.fullName,
        email: userData.email,
        profilePhoto: userData.profilePhoto,
      });
      setEditMode(false);
      fetchUser();
      updateUser(res.data);
      alert("User updated successfully");
    } catch (err) {
      alert("Failed to update user");
    }
  };

  const handleEdit = () => {
    setOriginalUserData(userData);
    setEditMode(true);
  };

  const handleCancel = () => {
    setUserData(originalUserData);
    setEditMode(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (onLogout) {
        onLogout();
      }
      window.location.reload();
    }
  };

  return (
    <div className="w-100 h-100 p-4" style={{ background: "#f7fafd", minHeight: "100vh" }}>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <button
          className="d-flex align-items-center"
          onClick={onBack}
          style={{
            background: "linear-gradient(90deg, #1976d2 60%, #00eaff 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 500,
            fontSize: 15,
            boxShadow: "0 2px 8px #1976d288",
            cursor: "pointer",
            transition: "background 0.2s",
            width: "auto",
          }}
        >
          <FaArrowLeft style={{ marginRight: 8 }} /> Back
        </button>

        {/* Logout Button */}
        <button
          className="d-flex align-items-center"
          onClick={handleLogout}
          style={{
            background: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 500,
            fontSize: 15,
            boxShadow: "0 2px 8px rgba(220, 53, 69, 0.3)",
            cursor: "pointer",
            transition: "all 0.2s",
            width: "auto",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#c82333";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#dc3545";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <FaSignOutAlt style={{ marginRight: 8 }} /> Logout
        </button>
      </div>
      <h3 className="text-center mb-4" style={{ fontWeight: 600, color: "#1976d2", letterSpacing: 1 }}>My Profile</h3>
      <div className="mb-3 text-center" style={{ position: "relative", display: "inline-block" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={
              userData.profilePhoto ||
              "https://ui-avatars.com/api/?name=" + encodeURIComponent(userData.fullName)
            }
            alt="Profile"
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              border: "2px solid #1976d2",
              objectFit: "cover",
              marginBottom: 10,
              boxShadow: "0 2px 8px #1976d288",
            }}
          />
          {editMode && (
            <label
              htmlFor="profile-photo-input"
              style={{
                position: "absolute",
                top: 50,
                left: 650,
                background: "linear-gradient(90deg, #1976d2 60%, #00eaff 100%)",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px #1976d288",
                border: "2px solid #fff",
                zIndex: 10,
              }}
              title="Change profile photo"
            >
              <FaEdit size={15} />
              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
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
          )}
        </div>
        {uploading && <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Uploading...</div>}
        <div className="mt-2" style={{ fontWeight: 500, fontSize: 19, color: "#222", letterSpacing: 0.5 }}>
          {editMode ? (
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              style={{
                fontSize: 17,
                fontWeight: 500,
                border: "1.5px solid #c7e0fa",
                borderRadius: 8,
                padding: "6px 12px",
                width: 240,
                marginBottom: 4,
                background: "#fafdff",
                outline: "none",
                transition: "border 0.2s",
                boxShadow: "0 1px 4px #1976d211",
              }}
              placeholder={originalUserData ? originalUserData.fullName : userData.fullName}
              autoFocus
              onFocus={e => (e.target.style.border = "1.5px solid #1976d2")}
              onBlur={e => (e.target.style.border = "1.5px solid #c7e0fa")}
            />
          ) : (
            userData.fullName
          )}
        </div>
        <div style={{ color: "#666", fontSize: 14, fontWeight: 400 }}>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              style={{
                fontSize: 14,
                fontWeight: 400,
                border: "1.5px solid #c7e0fa",
                borderRadius: 8,
                padding: "6px 12px",
                width: 240,
                background: "#fafdff",
                outline: "none",
                transition: "border 0.2s",
                boxShadow: "0 1px 4px #1976d211",
              }}
              placeholder={originalUserData ? originalUserData.email : userData.email}
              onFocus={e => (e.target.style.border = "1.5px solid #1976d2")}
              onBlur={e => (e.target.style.border = "1.5px solid #c7e0fa")}
            />
          ) : (
            userData.email
          )}
        </div>
        <div style={{ color: "#888", fontSize: 14, fontWeight: 400 }}>
          @{userData.username}
        </div>
      </div>
      <div className="d-flex justify-content-center mb-4">
        {editMode ? (
          <>
            <button
              className="btn"
              onClick={handleSave}
              disabled={uploading}
              style={{
                background: "linear-gradient(90deg, #1976d2 60%, #00eaff 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontWeight: 500,
                fontSize: 15,
                boxShadow: "0 2px 8px #1976d288",
                display: "flex",
                alignItems: "center",
                gap: 6,
                width: "auto",
                marginRight: 8,
              }}
            >
              <FaSave /> Save
            </button>
            <button
              className="btn"
              onClick={handleCancel}
              style={{
                background: "#e0e0e0",
                color: "#1976d2",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontWeight: 500,
                fontSize: 15,
                boxShadow: "0 2px 8px #1976d211",
                display: "flex",
                alignItems: "center",
                gap: 6,
                width: "auto",
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="btn"
            onClick={handleEdit}
            style={{
              background: "linear-gradient(90deg, #1976d2 60%, #00eaff 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: 500,
              fontSize: 15,
              boxShadow: "0 2px 8px #1976d288",
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "auto",
            }}
          >
            <FaEdit /> Edit
          </button>
        )}
      </div>
      <div className="d-flex" style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Left: My Groups */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h5 style={{ fontWeight: 600, color: "#1976d2", letterSpacing: 0.5 }}>My Groups</h5>
          {myGroups.length === 0 ? (
            <div className="text-muted" style={{ fontSize: 15 }}>You are not part of any groups.</div>
          ) : (
            <ul className="list-group">
              {myGroups.map(group => (
                <li
                  key={group._id}
                  className="list-group-item d-flex align-items-center"
                  style={{
                    cursor: "pointer",
                    border: "none",
                    borderRadius: 8,
                    marginBottom: 8,
                    boxShadow: "0 1px 6px #1976d222",
                    background: "#fff",
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                  onClick={() => onGoToChat && onGoToChat(group)}
                >
                  {group.groupPhoto ? (
                    <img
                      src={group.groupPhoto}
                      alt="Group"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: 12,
                        border: "2px solid #1976d2",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        fontWeight: 700,
                        color: "#1976d2",
                        fontSize: 16,
                      }}
                    >
                      {group.chatName ? group.chatName[0].toUpperCase() : "G"}
                    </div>
                  )}
                  <span>{group.chatName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Divider */}
        <div style={{
          width: 1,
          background: "#e0e0e0",
          margin: "0 32px",
          minHeight: 180,
          alignSelf: "stretch"
        }} />
        {/* Right: Placeholder for future section */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h5 style={{ fontWeight: 600, color: "#1976d2", letterSpacing: 0.5 }}>Other</h5>
          <div className="text-muted" style={{ fontSize: 15 }}>Coming soon...</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;