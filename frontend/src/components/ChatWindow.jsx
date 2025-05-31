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
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { PersonCircle } from "react-bootstrap-icons";
import UserProfileSidebar from "./UserProfileSidebar";

const socket = io("http://localhost:5000");

const ChatWindow = ({ chat, userId, onStartNewChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searching, setSearching] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    msgId: null,
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chat?._id) {
      socket.emit("user-online", userId);
      fetchMessages(chat._id);
      socket.emit("join-chat", chat._id);
      socket.emit("mark-read", { chatId: chat._id, userId });

      socket.on("update-online-users", (users) => setOnlineUsers(users));
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
        if (chatId === chat._id && readerId !== userId) {
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
      const res = await axios.get(
        `http://localhost:5000/api/messages/${chatId}`
      );
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

    socket.emit("send-message", {
      senderId: userId,
      chatId: chat._id,
      content: newMsg.trim(),
    });

    setNewMsg("");
    setShowEmojiPicker(false);
    scrollToBottom();
  };

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
      const res = await axios.post("http://localhost:5000/api/user/search", {
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
      const res = await axios.post("http://localhost:5000/api/chat/create", {
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
      await axios.delete(`http://localhost:5000/api/messages/${msgId}`, {
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
      <div className="border-bottom p-3 bg-black shadow-sm sticky-top">
        <div className="ms-2 me-auto d-flex">
          <div className="d-flex align-items-center" style={{ width: "auto" }}>
            {otherUser?.profilePhoto ? (
              <img
                src={otherUser.profilePhoto}
                alt="Profile"
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: 8,
                }}
              />
            ) : (
              <PersonCircle
                size={35}
                className="me-2 text-secondary"
                style={{ width: "auto" }}
              />
            )}
          </div>
          <h5 className="m-0 text-truncate align-self-center">
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
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => {
                  setProfileUserId(otherUser?._id);
                  setShowProfile(true);
                }}
              >
                {otherUser?.fullName}
              </span>
            )}
          </h5>
        </div>
        {!chat.isGroupChat && onlineUsers.includes(String(otherUser?._id)) && (
          <div
            className="d-flex align-items-center mt-1"
            style={{ fontSize: "0.95rem" }}
          >
            <span className="text-success fw-semibold">Online</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-auto px-3"
        style={{ backgroundColor: "#f0f2f5", paddingBottom: "1rem" }}
      >
        <MessageList
          messages={messages}
          loading={loadingMessages}
          userId={userId}
          onContextMenu={handleContextMenu}
          messagesEndRef={messagesEndRef}
        />
        {contextMenu.visible && (
          <div
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              background: "#fff",
              border: "1px solid #ccc",
              color: "red",
              borderRadius: 4,
              zIndex: 9999,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              padding: "4px 0",
              width: "auto",
            }}
          >
            <div
              className="p-2"
              style={{ cursor: "pointer", width: "auto" }}
              onClick={() => handleDeleteMessage(contextMenu.msgId)}
            >
              Delete
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        newMsg={newMsg}
        setNewMsg={setNewMsg}
        sendMessage={sendMessage}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleEmojiClick={handleEmojiClick}
      />

      {/* User profile */}
      <UserProfileSidebar
        show={showProfile}
        onHide={() => setShowProfile(false)}
        userId={profileUserId}
        chat={chat}
        currentUserId={userId}
      />
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
