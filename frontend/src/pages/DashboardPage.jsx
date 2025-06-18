import React, { useState, useEffect, useRef } from "react";
import { Container, Modal, Button } from "react-bootstrap";
import axios from "axios";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MiniSidebar from "../components/MiniSidebar";
import Settings from "../components/Settings";
import VideoCall from "../components/VideoCall";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(import.meta.env.VITE_SOCKET_URL);

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user._id;

  const videoCallRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [incomingVideoCall, setIncomingVideoCall] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState(null);

  // Fetch Chats Once
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/chat/fetch`, {
          currentUserId,
        });
        setChats(res.data);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };

    fetchChats();
  }, [currentUserId]);

  useEffect(() => {
    socket.emit("register", currentUserId);

    socket.on("video-call-offer", ({ from, caller }) => {
      console.log("📞 Incoming video call from:", caller?.fullName || from);
      setIncomingVideoCall({ from, caller });
    });

    socket.on("call-rejected", () => {
      alert("Call rejected");
      if (videoCallRef.current) {
        videoCallRef.current.stopMedia();
      }
      setShowVideoCall(false);
    });

    return () => {
      socket.off("video-call-offer");
      socket.off("call-rejected");
    };
  }, [currentUserId]);

  const handleStartNewChat = (newChat) => {
    setChats((prev) => {
      const exists = prev.some((c) => c._id === newChat._id);
      return exists ? prev : [newChat, ...prev];
    });
    setSelectedChat(newChat);
  };

  return (
    <Container fluid className="vh-100 p-0">
      <div className="d-flex h-100">

        {/* 🔔 Incoming Call Modal */}
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
                  setRemoteUserId(incomingVideoCall.from); // ✅ key fix
                  setShowVideoCall(true);
                  setIncomingVideoCall(null);
                }}
              >
                Accept
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* 📹 Video Call Component */}
        {showVideoCall && remoteUserId && (
          <VideoCall
          ref={videoCallRef}
            userId={currentUserId}
            remoteUserId={remoteUserId}
            onClose={() => {
              setShowVideoCall(false);
              setRemoteUserId(null);
            }}
          />
        )}

        {/* Mini Sidebar */}
        <div
          style={{
            width: "60px",
            backgroundColor: "#f8f9fa",
            borderRight: "1px solid #dee2e6",
          }}
        >
          <MiniSidebar
            onOpenSettings={() => setShowSettings(true)}
            onCreateGroup={() => console.log("Open Group Chat Creation UI")}
          />
        </div>

        {/* Main Area */}
        <div className="d-flex flex-grow-1">
          {showSettings ? (
            <Settings
              onBack={() => setShowSettings(false)}
              onGoToChat={(chat) => {
                setSelectedChat(chat);
                setShowSettings(false);
              }}
            />
          ) : (
            <>
              <div
                style={{
                  width: "300px",
                  borderRight: "1px solid #dee2e6",
                }}
              >
                <Sidebar
                  chats={chats}
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                  userId={currentUserId}
                />
              </div>
              <div className="flex-grow-1">
                <ChatWindow
                  chat={selectedChat}
                  userId={currentUserId}
                  currentUserObject={user}
                  onStartNewChat={handleStartNewChat}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default DashboardPage;
