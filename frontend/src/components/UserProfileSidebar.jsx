import React, { useEffect, useState } from "react";
import { Offcanvas, Spinner } from "react-bootstrap";
import axios from "axios";

const UserProfileSidebar = ({ userId, chat, show, onHide }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // For direct chat: fetch user info
  useEffect(() => {
    if (show && userId && (!chat || !chat.isGroupChat)) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/user/${userId}`)
        .then((res) => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }
  }, [show, userId, chat]);

  if (!show) return null;

  if (chat && chat.isGroupChat) {
    return (
      <GroupProfileSidebar
        userId={userId}
        chat={chat}
        show={show}
        onHide={onHide}
      />
    );
  }

  // Direct user profile
  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>User Profile</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : user ? (
          <div className="text-center">
            <div className="mx-auto mb-3" style={{ width: 80, height: 80 }}>
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                    color: "#888",
                  }}
                >
                  <span>
                    {user.fullName
                      ? user.fullName[0].toUpperCase()
                      : user.username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h5>{user.fullName}</h5>
            <div className="mb-2 text-muted">@{user.username}</div>
            <div className="mb-2">
              <strong>Date Joined:</strong>{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </div>
            <div className="mb-2">
              <strong>Email:</strong> {user.email || "N/A"}
            </div>
            <div className="mb-2">
              <strong>Mobile:</strong> {user.mobile || "N/A"}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted">User not found</div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default UserProfileSidebar;