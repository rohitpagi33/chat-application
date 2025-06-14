import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Form,
  ListGroup,
  Modal,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { io } from "socket.io-client";
import axios from "axios";
import UserProfileSidebar from "./UserProfileSidebar";
import GroupProfileSidebar from "./GroupProfileSidebar";
import { createClient } from "@supabase/supabase-js";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { formatDate, renderFile } from "../utils/chatUtils";
import VideoCall from "./VideoCall";
import VoiceCall from "./VoiceCall"; // Add this import
import { MdVideoCall } from "react-icons/md";
import { MdCall } from "react-icons/md";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const socket = io(import.meta.env.VITE_SOCKET_URL);

const ChatWindow = ({ chat, userId, currentUserObject, onStartNewChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    msgId: null,
  });

  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const [incomingVideoCall, setIncomingVideoCall] = useState(null);

  useEffect(() => {
    if (userId) {
      socket.emit("register", userId);
    }
    if (chat?._id) {
      socket.emit("user-online", userId);
      fetchMessages(chat._id);
      socket.emit("join-chat", chat._id);
      socket.emit("mark-read", { chatId: chat._id, userId });

      socket.on("update-online-users", (users) => {
        setOnlineUsers(users);
      });

      socket.on("video-call-offer", ({ from, caller }) => {
        console.log("📞 Incoming call from", caller?.fullName || from);
        if (chat.users.some((u) => u._id === from)) {
          setIncomingVideoCall({ from, caller });
        }
      });

      socket.on("call-rejected", () => {
        alert("Call rejected");
        setShowVideoCall(false);
      });

      socket.on("receive-message", (msg) => {
        if (msg.chat === chat._id) {
          setMessages((prev) => [...prev, msg]);
          scrollToBottom();

          if (msg.sender._id !== userId) {
            socket.emit("mark-read", { chatId: chat._id, userId });
          }
        }
      });
      socket.on("messages-read", ({ chatId, userId: readerId }) => {
        if (chatId === chat?._id && readerId !== userId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.sender._id === userId ? { ...msg, isRead: true } : msg
            )
          );
        }
      });
    }

    return () => {
      socket.off("receive-message");
      socket.off("messages-read");
      socket.off("update-online-users");
      socket.off("video-call-offer");
      socket.off("call-rejected");
    };
  }, [chat]);

  useEffect(() => {
    const hideMenu = () =>
      setContextMenu({ visible: false, x: 0, y: 0, msgId: null });
    window.addEventListener("click", hideMenu);
    return () => window.removeEventListener("click", hideMenu);
  }, []);

  const fetchMessages = async (chatId) => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(`${API_BASE_URL}/api/messages/${chatId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = () => {
    if (!newMsg.trim() || !chat?._id) return;

    const data = {
      senderId: userId,
      chatId: chat._id,
      content: newMsg.trim(),
    };

    socket.emit("send-message", data);
    setNewMsg(""); // Clear input
    setShowEmojiPicker(false);
    scrollToBottom();
  };

  // --- File upload logic ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !chat?._id) return;
    setUploading(true);

    const filePath = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (error) {
      alert("File upload failed!");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setUploading(false);

    // Send as a file message
    socket.emit("send-message", {
      senderId: userId,
      chatId: chat._id,
      content: "",
      file: {
        url: publicUrlData.publicUrl,
        type: file.type,
        name: file.name,
      },
      messageType: "file",
    });
    scrollToBottom();
  };
  // --- End file upload logic ---

  const scrollToBottom = () => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    try {
      setSearching(true);
      const res = await axios.post(`${API_BASE_URL}/api/user/search`, {
        search: searchTerm.trim(),
      });
      setSearchResults(res.data.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("User search failed", error);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateChat = async (otherUserId) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const currentUserId = userData._id;
    const currentotherUserId = otherUserId._id;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat/create`, {
        currentUserId,
        currentotherUserId,
      });

      onStartNewChat(res.data);
      setShowStartChatModal(false);
      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      console.error("Create chat failed", err.response?.data || err);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/messages/${msgId}`, {
        data: { userId },
      });
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete message");
    }
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    const canDelete =
      msg.sender._id === userId &&
      new Date() - new Date(msg.createdAt) < 2 * 60 * 1000;
    if (canDelete) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        msgId: msg._id,
      });
    } else {
      setContextMenu({ visible: false, x: 0, y: 0, msgId: null });
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMsg((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (!chat) {
    return (
      <div className="d-flex flex-column h-100 justify-content-center align-items-center text-center p-4">
        <p className="text-muted">No chat selected</p>
        <Button
          onClick={() => setShowStartChatModal(true)}
          variant="outline-primary"
        >
          Start New Chat
        </Button>
        <StartChatModal
          show={showStartChatModal}
          onHide={() => setShowStartChatModal(false)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          onCreateChat={handleCreateChat}
          searching={searching}
        />
      </div>
    );
  }

  const otherUser = chat.users.find((u) => u._id !== userId);

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <div className="border-bottom d-flex p-3 bg-black shadow-sm sticky-top align-items-center">
        <div
          className="d-flex align-items-center"
          style={{ width: 50, height: 50 }}
        >
          {chat.isGroupChat ? (
            chat.groupPhoto ? (
              <img
                src={chat.groupPhoto}
                alt="Group"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "2px solid #e0e0e0",
                  background: "#fff",
                }}
                className=""
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: "#888",
                }}
                className="me-2"
              >
                <span>
                  {chat.chatName ? chat.chatName[0].toUpperCase() : "G"}
                </span>
              </div>
            )
          ) : (
            (() => {
              const otherUser = chat.users.find((u) => u._id !== userId);
              return otherUser?.profilePhoto ? (
                <img
                  src={otherUser.profilePhoto}
                  alt="User"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "2px solid #e0e0e0",
                    background: "#fff",
                  }}
                  className="me-2"
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: "#888",
                  }}
                  className="me-2"
                >
                  <span>
                    {otherUser?.fullName
                      ? otherUser.fullName[0].toUpperCase()
                      : otherUser?.username
                      ? otherUser.username[0].toUpperCase()
                      : "U"}
                  </span>
                </div>
              );
            })()
          )}
        </div>
        <div className="">
          {/* Chat Name */}
          <h5 className="m-0 text-truncate" style={{ flex: 1 }}>
            {chat.isGroupChat ? (
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setProfileUserId(null);
                  setShowProfile(true);
                }}
              >
                {chat.chatName}
              </span>
            ) : (
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const otherUser = chat.users.find((u) => u._id !== userId);
                  setProfileUserId(otherUser?._id);
                  setShowProfile(true);
                }}
              >
                {chat.users.find((u) => u._id !== userId)?.fullName}
              </span>
            )}
          </h5>

          {/* Online status for 1-to-1 */}
          {!chat.isGroupChat &&
            onlineUsers.includes(
              String(
                chat.users.find((u) => String(u._id) !== String(userId))?._id
              )
            ) && (
              <span
                className="text-success fw-semibold"
                style={{ fontSize: "0.75rem" }}
              >
                Online
              </span>
            )}
        </div>

        {/* Video Call Button - Only for 1-to-1 chats */}
        {!chat.isGroupChat && otherUser && (
          <>
            <Button
              variant="light"
              className="ms-2 d-flex align-items-center justify-content-center"
              style={{
                borderRadius: "50%",
                width: 40,
                height: 40,
                padding: 0,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
              title="Start Voice Call"
              onClick={() => setShowVoiceCall(true)} // For future use
            >
              <MdCall size={22} color="#1976d2" />
            </Button>
            <Button
              variant="light"
              onClick={() => setShowVideoCall(true)}
              className="ms-2 d-flex align-items-center justify-content-center"
              style={{
                borderRadius: "50%",
                width: 40,
                height: 40,
                padding: 0,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
              title="Start Video Call"
            >
              <MdVideoCall size={24} color="#1976d2" />
            </Button>
          </>
        )}
      </div>

      {incomingVideoCall && (
        <Modal show centered onHide={() => setIncomingVideoCall(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Incoming Video Call</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {incomingVideoCall.caller?.fullName || "Someone"} is calling...
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                socket.emit("call-rejected", { to: incomingVideoCall.from });
                setIncomingVideoCall(null);
              }}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowVideoCall(true);
                setIncomingVideoCall(null);
              }}
            >
              Accept
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-auto px-3"
        style={{
          backgroundColor: "#f0f2f5",
          scrollbarWidth: "none",
          paddingBottom: "1rem",
        }}
      >
        <MessageList
          messages={messages}
          loading={loadingMessages}
          userId={userId}
          onContextMenu={handleContextMenu}
          messagesEndRef={messagesEndRef}
          formatDate={formatDate}
          renderFile={renderFile}
          contextMenu={contextMenu}
          handleDeleteMessage={handleDeleteMessage}
          setContextMenu={setContextMenu}
        />
      </div>

      {/* Input */}
      <MessageInput
        newMsg={newMsg}
        setNewMsg={setNewMsg}
        sendMessage={sendMessage}
        uploading={uploading}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleEmojiClick={handleEmojiClick}
      />

      {chat.isGroupChat ? (
        <GroupProfileSidebar
          userId={userId}
          chat={chat}
          show={showProfile}
          onHide={() => setShowProfile(false)}
        />
      ) : (
        <UserProfileSidebar
          userId={profileUserId}
          chat={chat}
          show={showProfile}
          onHide={() => setShowProfile(false)}
        />
      )}

      {/* Video Call Component - Only for 1-to-1 chats */}
      {!chat.isGroupChat && showVideoCall && (
        <VideoCall
          userId={userId}
          remoteUserId={otherUser._id}
          onClose={() => setShowVideoCall(false)}
        />
      )}

      {/* Voice Call Component - Only for 1-to-1 chats */}
      {!chat.isGroupChat && showVoiceCall && (
        <VoiceCall
          userId={userId}
          remoteUserId={otherUser._id}
          localUser={currentUserObject} // Pass the real user object
          remoteUser={otherUser} // Pass the real other user object
          onClose={() => setShowVoiceCall(false)}
        />
      )}
    </div>
  );
};

const StartChatModal = ({
  show,
  onHide,
  searchTerm,
  setSearchTerm,
  onSearch,
  searchResults,
  setSearchResults,
  onCreateChat,
  searching,
}) => {
  const debounceTimeout = useRef(null);

  useEffect(() => {
    // Auto-search after user stops typing for 400ms
    if (!searchTerm.trim()) {
      onSearch("");
      setSearchResults([]);
      return;
    }

    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      onSearch(searchTerm);
    }, 400);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm]);

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Start New Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search users by name or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        {searching ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <ListGroup>
            {searchResults.length === 0 && (
              <p className="text-muted">No users found</p>
            )}
            {searchResults.map((user) => (
              <ListGroup.Item
                key={user._id}
                action
                onClick={() => onCreateChat(user)}
              >
                {user.fullName || user.username}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ChatWindow;
