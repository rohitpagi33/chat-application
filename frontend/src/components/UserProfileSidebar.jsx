import React, { useEffect, useState } from "react";
import { Offcanvas, Spinner, ListGroup, Badge, Button } from "react-bootstrap";
import axios from "axios";

const UserProfileSidebar = ({ userId, chat, show, onHide }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [admin, setAdmin] = useState(null);

  // For member profile view
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

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

  // For group chat: fetch group users and admin
  useEffect(() => {
    if (show && chat && chat.isGroupChat) {
      setLoading(true);
      setSelectedMember(null);
      setMemberProfile(null);
      axios
        .get(`http://localhost:5000/api/chat/${chat._id}`)
        .then((res) => {
          setGroupUsers(res.data.users || []);
          setAdmin(res.data.admin || null);
        })
        .catch(() => {
          setGroupUsers([]);
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    }
  }, [show, chat]);

  // Fetch member profile when selected
  const fetchMemberProfile = (memberId) => {
    setLoadingMember(true);
    axios
      .get(`http://localhost:5000/api/user/${memberId}`)
      .then((res) => setMemberProfile(res.data))
      .catch(() => setMemberProfile(null))
      .finally(() => setLoadingMember(false));
  };

  // Reset member view when sidebar closes
  useEffect(() => {
    if (!show) {
      setSelectedMember(null);
      setMemberProfile(null);
    }
  }, [show]);

  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          {chat && chat.isGroupChat
            ? selectedMember
              ? "Member Profile"
              : "Group Info"
            : "User Profile"}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : chat && chat.isGroupChat ? (
          selectedMember ? (
            <div className="text-center">
              <Button
                variant="link"
                className="mb-3"
                onClick={() => {
                  setSelectedMember(null);
                  setMemberProfile(null);
                }}
              >
                &larr; Back to group
              </Button>
              {loadingMember ? (
                <Spinner animation="border" />
              ) : memberProfile ? (
                <>
                  <div
                    className="mx-auto mb-3"
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
                      {memberProfile.fullName
                        ? memberProfile.fullName[0].toUpperCase()
                        : memberProfile.username[0].toUpperCase()}
                    </span>
                  </div>
                  <h5>{memberProfile.fullName}</h5>
                  <div className="mb-2 text-muted">@{memberProfile.username}</div>
                  <div className="mb-2">
                    <strong>Date Joined:</strong>{" "}
                    {memberProfile.createdAt
                      ? new Date(memberProfile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {memberProfile.email || "N/A"}
                  </div>
                  <div className="mb-2">
                    <strong>Mobile:</strong> {memberProfile.mobile || "N/A"}
                  </div>
                </>
              ) : (
                <div className="text-muted">User not found</div>
              )}
            </div>
          ) : (
            <div>
              <div
                className="mx-auto mb-3"
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
                  {chat.chatName ? chat.chatName[0].toUpperCase() : "G"}
                </span>
              </div>
              <h5 className="text-center">{chat.chatName}</h5>
              <div className="mb-2 text-center">
                <Badge bg="secondary">
                  {groupUsers.length} member{groupUsers.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="mb-2 text-center">
                <strong>Admin:</strong>{" "}
                {admin
                  ? admin.fullName || admin.username
                  : groupUsers[0]?.fullName || groupUsers[0]?.username || "N/A"}
              </div>
              <div className="mb-2 text-center">
                <strong>Created:</strong>{" "}
                {chat.createdAt
                  ? new Date(chat.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
              <hr />
              <div>
                <strong>Members:</strong>
                <ListGroup className="mt-2">
                  {groupUsers.map((member) => (
                    <ListGroup.Item
                      key={member._id}
                      action
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedMember(member);
                        fetchMemberProfile(member._id);
                      }}
                    >
                      {member.fullName || member.username}
                      {admin && admin._id === member._id && (
                        <Badge bg="info" className="ms-2">
                          Admin
                        </Badge>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>
          )
        ) : user ? (
          <div className="text-center">
            {/* Placeholder avatar */}
            <div
              className="mx-auto mb-3"
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