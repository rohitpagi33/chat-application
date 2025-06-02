import React, { useEffect, useState } from "react";
import { Offcanvas, Spinner, ListGroup, Button } from "react-bootstrap";
import axios from "axios";
import {
  StarFill,
  GearFill,
  PersonPlusFill,
  BoxArrowRight,
} from "react-bootstrap-icons";
import GroupChatSettings from "./GroupChatSettings";
import AddMemberModal from "./AddMemberModal";

const GroupProfileSidebar = ({ userId, chat, show, onHide }) => {
  const [groupUsers, setGroupUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

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

  const fetchMemberProfile = (memberId) => {
    setLoadingMember(true);
    axios
      .get(`http://localhost:5000/api/user/${memberId}`)
      .then((res) => setMemberProfile(res.data))
      .catch(() => setMemberProfile(null))
      .finally(() => setLoadingMember(false));
  };

  useEffect(() => {
    if (!show) {
      setSelectedMember(null);
      setMemberProfile(null);
    }
  }, [show]);

  const sortedMembers = [
    // Current user first
    ...groupUsers.filter((u) => u._id === userId),
    // Then admin (if not current user)
    ...groupUsers.filter(
      (u) => u._id !== userId && admin && u._id === admin._id
    ),
    ...groupUsers
      .filter((u) => u._id !== userId && (!admin || u._id !== admin._id))
      .sort((a, b) =>
        (a.fullName || a.username).localeCompare(b.fullName || b.username)
      ),
  ];

  const handleLeaveGroup = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/chat/leave", {
        chatId: chat._id,
        userId,
      });
      console.log("Leave group response:", res.data);
      onHide();
      const users = res.data.chat?.users || [];
      if (!users.some((u) => u === userId || u._id === userId)) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to leave group:", err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.post("http://localhost:5000/api/chat/remove-member", {
        chatId: chat._id,
        memberId,
      });
      refreshGroupUsers();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const refreshGroupUsers = () => {
    axios.get(`http://localhost:5000/api/chat/${chat._id}`).then((res) => {
      setGroupUsers(res.data.users || []);
      setAdmin(res.data.admin || null);
    });
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          {selectedMember ? "Member Profile" : "Group Info"}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : selectedMember ? (
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
                {memberProfile.profilePhoto ? (
                  <img
                    src={memberProfile.profilePhoto}
                    alt="Profile"
                    className="mx-auto mb-3"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      display: "block",
                    }}
                  />
                ) : (
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
                )}
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
            {chat.groupPhoto ? (
              <img
                src={chat.groupPhoto}
                alt="Group"
                className="mx-auto mb-3"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "2px solid #e0e0e0",
                  background: "#fff",
                  display: "block",
                }}
              />
            ) : (
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
            )}
            <h5 className="text-center">{chat.chatName}</h5>
            <div className="mb-2 text-center">
              <span className="badge bg-secondary">
                {groupUsers.length} member{groupUsers.length !== 1 ? "s" : ""}
              </span>
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
            {/* Action icons row */}
            <div className="d-flex justify-content-center mb-3 gap-4">
              <GearFill
                size={22}
                role="button"
                title="Group Settings"
                onClick={() => setShowSettings(true)}
                style={{ cursor: "pointer" }}
              />
              <PersonPlusFill
                size={22}
                role="button"
                title="Add Member"
                onClick={() => setShowAddMember(true)}
                style={{ cursor: "pointer" }}
              />
              <BoxArrowRight
                size={22}
                role="button"
                title="Leave Group"
                onClick={handleLeaveGroup}
                style={{ cursor: "pointer", color: "#dc3545" }}
              />
            </div>
            <GroupChatSettings
              show={showSettings}
              onHide={() => setShowSettings(false)}
            />
            <AddMemberModal
              show={showAddMember}
              onHide={() => setShowAddMember(false)}
              chatId={chat._id}
              currentMembers={groupUsers}
              onMembersAdded={refreshGroupUsers}
            />
            <div>
              <strong>Members:</strong>
              <ListGroup className="mt-2">
                {sortedMembers.map((member) => (
                  <ListGroup.Item
                    key={member._id}
                    action
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                    }}
                    onClick={() => {
                      setSelectedMember(member);
                      fetchMemberProfile(member._id);
                    }}
                  >
                    {member.profilePhoto ? (
                      <img
                        src={member.profilePhoto}
                        alt="Profile"
                        style={{
                          width: 36,
                          height: 36,
                          minWidth: 36,
                          borderRadius: "50%",
                          border: "1.5px solid #e0e0e0",
                          background: "#fff",
                          marginRight: 8,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          minWidth: 36,
                          borderRadius: "50%",
                          background: "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          color: "#888",
                          marginRight: 8,
                        }}
                      >
                        <span>
                          {(member.fullName ||
                            member.username)[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    <span style={{ flex: 1 }}>
                      {member._id === userId
                        ? "You"
                        : member.fullName || member.username}
                    </span>
                    {admin && admin._id === member._id && (
                      <StarFill
                        color="#28a745"
                        size={18}
                        style={{ width: "auto" }}
                        title="Admin"
                      />
                    )}
                    {/* Remove button for admin, not for themselves */}
                    {admin && admin._id === userId && member._id !== userId && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={{ marginLeft: 8, width: "auto" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(member._id);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default GroupProfileSidebar;
