import React, { useState, useEffect, useRef } from "react";
import {
  Paperclip,
  EmojiSmile,
  At,
  Send,
  Check,
  CheckAll,
  FileEarmarkPdf,
  FileEarmarkImage,
  FileEarmark,
} from "react-bootstrap-icons";
import "../App.css";
import {
  Button,
  Form,
  ListGroup,
  Modal,
  InputGroup,
  FormControl,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { io } from "socket.io-client";
import UserProfileSidebar from "./UserProfileSidebar";
import EmojiPicker from "emoji-picker-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const socket = io("http://localhost:5000");

const ChatWindow = ({ chat, userId, onStartNewChat }) => {
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

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    msgId: null,
  });

  // File upload state
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (chat?._id) {
      socket.emit("user-online", userId);
      fetchMessages(chat._id);
      socket.emit("join-chat", chat._id);
      socket.emit("mark-read", { chatId: chat._id, userId });

      socket.on("update-online-users", (users) => {
        setOnlineUsers(users);
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
    };
  }, [chat]);

  useEffect(() => {
    // Hide context menu on click anywhere
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
      .from("avatars") // use avatars bucket
      .upload(filePath, file);

    if (error) {
      alert("File upload failed!");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars") // use avatars bucket
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = nowOnly - dateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      // Show weekday name
      return date.toLocaleDateString(undefined, { weekday: "long" });
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
      });
    }
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper to render file preview
  const renderFile = (file) => {
    if (!file?.url) return null;
    const ext = file.name?.split(".").pop().toLowerCase();

    // Common style for file box
    const fileBoxStyle = {
      background: "#f8f9fa",
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      padding: "12px 16px",
      marginBottom: 6,
      display: "flex",
      alignItems: "center",
      gap: 12,
      maxWidth: 320,
      wordBreak: "break-all",
    };

    // File name style
    const fileNameStyle = {
      color: "#222",
      fontWeight: 600,
      fontSize: "1rem",
      marginBottom: 2,
      textDecoration: "none",
    };

    if (file.type?.startsWith("image/")) {
      return (
        <div style={fileBoxStyle}>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            <img
              src={file.url}
              alt={file.name}
              style={{
                maxWidth: 80,
                maxHeight: 80,
                borderRadius: 6,
                border: "1px solid #eee",
                marginRight: 10,
              }}
            />
          </a>
          <div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              style={fileNameStyle}
            >
              {file.name}
            </a>
            <div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="small text-primary"
                style={{ textDecoration: "underline" }}
              >
                View Image
              </a>
            </div>
          </div>
        </div>
      );
    }
    if (ext === "pdf") {
      return (
        <div style={fileBoxStyle}>
          <FileEarmarkPdf size={36} className="me-2 text-danger" />
          <div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              style={fileNameStyle}
            >
              {file.name}
            </a>
            <div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="small text-primary"
                style={{ textDecoration: "underline" }}
              >
                Open PDF
              </a>
            </div>
          </div>
        </div>
      );
    }
    if (["ppt", "pptx"].includes(ext)) {
      return (
        <div style={fileBoxStyle}>
          <FileEarmark size={36} className="me-2 text-warning" />
          <div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              style={fileNameStyle}
            >
              {file.name}
            </a>
            <div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="small text-primary"
                style={{ textDecoration: "underline" }}
              >
                Open Presentation
              </a>
            </div>
          </div>
        </div>
      );
    }
    // Generic file
    return (
      <div style={fileBoxStyle}>
        <FileEarmark size={36} className="me-2 text-secondary" />
        <div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            style={fileNameStyle}
          >
            {file.name}
          </a>
          <div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="small text-primary"
              style={{ textDecoration: "underline" }}
            >
              Open File
            </a>
          </div>
        </div>
      </div>
    );
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
          onCreateChat={handleCreateChat}
          searching={searching}
        />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <div className="border-bottom p-3 bg-black shadow-sm sticky-top d-flex align-items-center gap-3">
        {/* Avatar/Profile/Group Photo */}
        {chat.isGroupChat ? (
          chat.groupPhoto ? (
            <img
              src={chat.groupPhoto}
              alt="Group"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
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
                  objectFit: "cover",
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
            <span className="text-success fw-semibold ms-2" style={{ fontSize: "0.95rem" }}>
              Online
            </span>
          )}
      </div>

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-auto px-3"
        style={{
          backgroundColor: "#f0f2f5",
          scrollbarWidth: "none",
          paddingBottom: "1rem",
        }}
      >
        {loadingMessages ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : (
          <ListGroup variant="flush">
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const showDate =
                !prevMsg ||
                new Date(prevMsg.createdAt).toDateString() !==
                  new Date(msg.createdAt).toDateString();

              const canDelete =
                msg.sender._id === userId &&
                new Date() - new Date(msg.createdAt) < 2 * 60 * 1000;

              return (
                <React.Fragment key={msg._id}>
                  {showDate && (
                    <div
                      className="mx-auto text-center text-muted sticky-top mb-2 p-2"
                      style={{
                        minWidth: "200px",
                        backgroundColor: "rgb(240, 242, 245)",
                      }}
                    >
                      <span
                        className="mx-auto p-2 mb-2"
                        style={{
                          fontSize: "0.85rem",
                          borderRadius: "8px",
                          backgroundColor: "rgb(210, 216, 223)",
                        }}
                      >
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <ListGroup.Item
                    className={`mb-2 rounded shadow-sm px-3 py-2 ${
                      msg.sender._id === userId
                        ? "bg-primary text-white ms-auto"
                        : "bg-light me-auto"
                    }`}
                    style={{ maxWidth: "70%", transition: "all 0.3s ease" }}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                    title={
                      canDelete
                        ? "Right-click to delete (within 2 minutes)"
                        : undefined
                    }
                  >
                    <div className="small fw-bold">
                      {msg.sender.fullName || msg.sender.username}
                    </div>
                    {/* File preview */}
                    {msg.file && msg.file.url && renderFile(msg.file)}
                    {/* Text message */}
                    {msg.content && <div>{msg.content}</div>}
                    <div
                      className="d-flex flex-row justify-content-end align-items-center mt-2"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <div
                        className="d-flex flex-row align-items-center gap-0"
                        style={{ width: "20%", gap: "2px" }}
                      >
                        <span
                          className="text-dark"
                          style={{ textAlign: "right" }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.sender._id === userId && (
                          <span
                            className="text-light"
                            style={{ textAlign: "right" }}
                          >
                            {msg.isRead ? (
                              <CheckAll size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </ListGroup>
        )}
        {/* Custom context menu */}
        {contextMenu.visible && (
          <div
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 4,
              zIndex: 9999,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              width: "auto",
              padding: "4px 0",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                color: "red",
                fontWeight: 500,
              }}
              onClick={() => {
                handleDeleteMessage(contextMenu.msgId);
                setContextMenu({ visible: false, x: 0, y: 0, msgId: null });
              }}
            >
              Delete
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-3 border-0 bg-transparent"
      >
        <div
          className="chat-input rounded-3 shadow-sm d-flex w-100 align-items-center"
          style={{ position: "relative" }}
        >
          {/* Message Input (70%) */}
          <div className="input-wrapper me-2">
            <FormControl
              as="input"
              placeholder="Message"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              className="border-0 shadow-none w-100 px-2 py-1"
              disabled={uploading}
            />
          </div>

          {/* Icons (Each 10% of full width) */}
          <div className="d-flex align-items-center justify-content-between icon-group">
            <Button
              variant="link"
              className="icon-btn p-0"
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              title="Attach file"
            >
              <Paperclip size={20} />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
            />

            <div style={{ position: "relative" }}>
              <Button
                variant="link"
                className="icon-btn p-0"
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
              >
                <EmojiSmile size={18} />
              </Button>
              {showEmojiPicker && (
                <div
                  style={{
                    position: "absolute",
                    scrollbarWidth: "none",
                    bottom: "40px",
                    right: 0,
                    zIndex: 1000,
                    msOverflowStyle: "none",
                  }}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            <Button
              variant="link"
              className="icon-btn submit-icon p-0"
              type="submit"
              disabled={uploading}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </Form>

      <UserProfileSidebar
        userId={profileUserId}
        chat={chat}
        show={showProfile}
        onHide={() => setShowProfile(false)}
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
  onCreateChat,
  searching,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Start New Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <FormControl
            className="mb-3"
            placeholder="Search users by name or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(searchTerm)}
          />
          <Button onClick={() => onSearch(searchTerm)}>Search</Button>
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
                className="hover-shadow"
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
