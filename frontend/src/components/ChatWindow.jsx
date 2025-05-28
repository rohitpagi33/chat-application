import React, { useState, useEffect, useRef } from "react";
import { Paperclip, EmojiSmile, At, Send, Check, CheckAll } from "react-bootstrap-icons";
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

  useEffect(() => {
    if (chat?._id) {
      fetchMessages(chat._id);
      socket.emit("join-chat", chat._id);

      socket.on("receive-message", (msg) => {
        if (msg.chat === chat._id) {
          setMessages((prev) => [...prev, msg]);
          scrollToBottom();
        }
      });

      // Send read confirmation when opening the chat
      socket.emit("mark-read", { chatId: chat._id, userId });
    }

    return () => {
      socket.off("receive-message");
    };
  }, [chat]);

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
        currentotherUserId
      });

      onStartNewChat(res.data);
      setShowStartChatModal(false);
      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      //console.log(currentUserId, currentotherUserId);
      console.error("Create chat failed", err.response?.data || err);
    }
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
      <div className="border-bottom p-3 bg-black shadow-sm sticky-top">
        <h5 className="m-0 text-truncate">
          {chat.isGroupChat
            ? chat.chatName
            : chat.users.find((u) => u._id !== userId)?.fullName}
        </h5>
      </div>

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-auto p-3"
        style={{ backgroundColor: "#f0f2f5" }}
      >
        {loadingMessages ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : (
          <ListGroup variant="flush">
            {messages.map((msg) => (
              <ListGroup.Item
                key={msg._id}
                className={`mb-2 rounded shadow-sm px-3 py-2 ${msg.sender._id === userId
                  ? "bg-primary text-white ms-auto"
                  : "bg-light me-auto"
                  }`}
                style={{ maxWidth: "70%", transition: "all 0.3s ease" }}
              >
                <div className="small fw-bold">
                  {msg.sender.fullName || msg.sender.username}
                </div>
                <div>{msg.content}</div>

                <div className="d-flex justify-content-end align-items-center mt-2" style={{ fontSize: "0.75rem" }}>
  <div className="d-flex align-items-center gap-1">
    <span className="text-light">
      {new Date(msg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
    {msg.sender._id === userId && (
      <span className="text-light">
        {msg.isRead ? <CheckAll size={14} /> : <Check size={14} />}
      </span>
    )}
  </div>
</div>


              </ListGroup.Item>
            ))}
            <div ref={messagesEndRef} />
          </ListGroup>
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
        <div className="chat-input rounded-3 shadow-sm d-flex w-100 align-items-center">
          {/* Message Input (70%) */}
          <div className="input-wrapper me-2">
            <FormControl
              as="input"
              placeholder="Message"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              className="border-0 shadow-none w-100 px-2 py-1"
            />
          </div>

          {/* Icons (Each 10% of full width) */}
          <div className="d-flex align-items-center justify-content-between icon-group">
            <Button variant="link" className="icon-btn p-0" type="button">
              <Paperclip size={20} />
            </Button>

            <Button variant="link" className="icon-btn p-0" type="button">
              <EmojiSmile size={20} />
            </Button>

            <Button
              variant="link"
              className="icon-btn submit-icon p-0"
              type="submit"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </Form>
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
