import React, { useState, useEffect, useRef } from "react";
import { Container, Modal, Button } from "react-bootstrap";
import axios from "axios";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MiniSidebar from "../components/MiniSidebar";
import Settings from "../components/Settings";
import VideoCall from "../components/VideoCall";
import VoiceCall from "../components/VoiceCall";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(import.meta.env.VITE_SOCKET_URL);

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user._id;

  const videoCallRef = useRef(null);
  const voiceCallRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [incomingVideoCall, setIncomingVideoCall] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null); // ✅ New

  const [incomingVoiceCall, setIncomingVoiceCall] = useState(null);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [voiceCallRemoteUserId, setVoiceCallRemoteUserId] = useState(null);
  const [voiceCallRemoteUser, setVoiceCallRemoteUser] = useState(null); // ✅ New

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
      if (videoCallRef.current) {
        videoCallRef.current.stopMedia();
      }
      setShowVideoCall(false);
      setRemoteUserId(null);
      setRemoteUser(null);
      window.location.reload();
    });

    socket.on("voice-call-offer", ({ from, caller }) => {
      console.log("🎧 Incoming voice call from:", caller?.fullName || from);
      setIncomingVoiceCall({ from, caller });
    });

    socket.on("voice-call-rejected", () => {
      if (voiceCallRef.current) {
        voiceCallRef.current.stopMedia();
      }
      setShowVoiceCall(false);
      setVoiceCallRemoteUserId(null);
      alert("The user has rejected your voice call.");
    });

    return () => {
      socket.off("video-call-offer");
      socket.off("call-rejected");
      socket.off("voice-call-offer");
      socket.off("voice-call-rejected");
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
        {/* Incoming Voice Call Modal */}
        {incomingVoiceCall && (
          <Modal show centered onHide={() => setIncomingVoiceCall(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Incoming Voice Call</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {incomingVoiceCall.caller?.fullName || "Someone"} is calling
              you...
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  socket.emit("voice-call-rejected", {
                    to: incomingVoiceCall.from,
                  });
                  if (voiceCallRef.current) {
                    voiceCallRef.current.stopMedia();
                  }
                  setIncomingVoiceCall(null);
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setVoiceCallRemoteUserId(incomingVoiceCall.from);
                  setVoiceCallRemoteUser(incomingVoiceCall.caller); // ✅
                  setShowVoiceCall(true);
                  setIncomingVoiceCall(null);
                }}
              >
                Accept
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* Incoming Video Call Modal */}
        {incomingVideoCall && (
          <Modal show centered onHide={() => setIncomingVideoCall(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Incoming Video Call</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {incomingVideoCall.caller?.fullName || "Someone"} is calling
              you...
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  socket.emit("call-rejected", { to: incomingVideoCall.from });
                  if (videoCallRef.current) {
                    videoCallRef.current.stopMedia();
                  }
                  setIncomingVideoCall(null);
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setRemoteUserId(incomingVideoCall.from);
                  setRemoteUser(incomingVideoCall.caller); // ✅
                  setShowVideoCall(true);
                  setIncomingVideoCall(null);
                }}
              >
                Accept
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* Voice Call UI */}
        {showVoiceCall && voiceCallRemoteUserId && (
          <VoiceCall
            ref={voiceCallRef}
            userId={currentUserId}
            remoteUserId={voiceCallRemoteUserId}
            remoteUser={voiceCallRemoteUser} // ✅
            localUser={user} // ✅
            onClose={() => {
              setShowVoiceCall(false);
              setVoiceCallRemoteUserId(null);
              setVoiceCallRemoteUser(null);
            }}
          />
        )}

        {/* Video Call UI */}
        {showVideoCall && remoteUserId && (
          <VideoCall
            ref={videoCallRef}
            userId={currentUserId}
            remoteUserId={remoteUserId}
            remoteUser={remoteUser} // ✅
            localUser={user} // ✅
            onClose={() => {
              setShowVideoCall(false);
              setRemoteUserId(null);
              setRemoteUser(null);
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

        {/* Main Content */}
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
