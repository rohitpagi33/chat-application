import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MiniSidebar from "../components/MiniSidebar";
import Settings from "../components/Settings";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user._id;

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false); // <-- Add state
  const [showProfile, setShowProfile] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  // Fetch chats for the current user
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

  // Fetch chats on page load and whenever chats are updated
  useEffect(() => {
    fetchChats();
  }, [chats]); // Whenever chats change, re-fetch

  // Handle new chat creation (no duplicates in sidebar)
  const handleStartNewChat = (newChat) => {
    setChats((prevChats) => {
      // Avoid duplicates
      const isDuplicate = prevChats.some((chat) => chat._id === newChat._id);
      if (isDuplicate) return prevChats;
      return [newChat, ...prevChats];
    });
    setSelectedChat(newChat);
  };

  const handleOpenSettings = () => {
    setShowSettings(true); // <-- Show settings
  };

  const handleCloseSettings = () => {
    setShowSettings(false); // <-- Hide settings
  };

  const handleCreateGroup = () => {
    console.log("Open Group Chat Creation UI");
  };

  return (
    <Container fluid className="vh-100 p-0">
      <div className="d-flex h-100">
        {/* Mini Sidebar */}
        <div
          style={{
            width: "60px",
            backgroundColor: "#f8f9fa",
            borderRight: "1px solid #dee2e6",
          }}
        >
          <MiniSidebar
            onOpenSettings={handleOpenSettings}
            onCreateGroup={handleCreateGroup}
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
              {/* Sidebar */}
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
              {/* Chat Window */}
              <div className="flex-grow-1">
                <ChatWindow
                  chat={selectedChat}
                  userId={currentUserId}
                  currentUserObject={user} // Pass the real user object here
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
