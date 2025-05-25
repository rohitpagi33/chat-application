// import React, { useState, useEffect, useRef } from "react";
// import {
//   Button,
//   Form,
//   ListGroup,
//   Modal,
//   InputGroup,
//   FormControl,
// } from "react-bootstrap";
// import axios from "axios";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000"); // socket.io server

// const ChatWindow = ({ chat, userId, onStartNewChat }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const [showStartChatModal, setShowStartChatModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   // const [users, setUsers] = useState([]);
//   const [searchResults, setSearchResults] = useState([]);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (chat?._id) {
//       fetchMessages(chat._id);

//       socket.emit("join-chat", chat._id);

//       socket.on("receive-message", (msg) => {
//         if (msg.chat === chat._id) {
//           setMessages((prev) => [...prev, msg]);
//         }
//       });
//     }

//     return () => {
//       socket.off("receive-message");
//     };
//   }, [chat]);

//   const fetchMessages = async (chatId) => {
//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/messages/${chatId}`
//       );
//       setMessages(res.data);
//       scrollToBottom();
//     } catch (err) {
//       console.error("Failed to fetch messages", err);
//     }
//   };

//   const sendMessage = () => {
//     if (!newMsg.trim() || !chat?._id) return;

//     const data = {
//       senderId: userId,
//       chatId: chat._id,
//       content: newMsg.trim(),
//     };

//     socket.emit("send-message", data);
//     setMessages((prev) => [
//       ...prev,
//       {
//         ...data,
//         _id: Date.now(),
//         sender: { _id: userId },
//         createdAt: new Date(),
//       },
//     ]);
//     setNewMsg("");
//     scrollToBottom();
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Search users to start new chat
//   const handleSearch = async (searchTerm) => {
//     console.log("handleSearch called with:", searchTerm); // <--- Add this line
//     if (!searchTerm.trim()) return;

//     try {
//       const res = await axios.post("http://localhost:5000/api/user/search", {
//         search: searchTerm.trim(),
//       });
//       setSearchResults(res.data.filter((u) => u._id !== userId));
//       // <-- you should use setSearchResults, not setUsers
//     } catch (error) {
//       console.error("User search failed", error);
//     }
//   };

//   // Start new chat with selected user
//   const handleCreateChat = async (otherUserId) => {
//   try {
//     const res = await axios.post(`http://localhost:5000/api/chat/create`, {
//       userId,
//       otherUserId,
//     });
//     onStartNewChat(res.data);
//     setShowStartChatModal(false);
//     setSearchTerm("");
//     setSearchResults([]);
//   } catch (err) {
//     console.error("Create chat failed", err);
//   }
// };




//   if (!chat) {
//     return (
//       <div className="d-flex flex-column h-100 justify-content-center align-items-center">
//         <p>No chat selected</p>
//         <Button onClick={() => setShowStartChatModal(true)}>
//           Start New Chat
//         </Button>

//         <StartChatModal
//           show={showStartChatModal}
//           onHide={() => setShowStartChatModal(false)}
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           onSearch={handleSearch}
//           searchResults={searchResults}
//           onCreateChat={handleCreateChat}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="d-flex flex-column h-100">
//       <div className="border-bottom p-3">
//         <h5>
//           {chat.isGroupChat
//             ? chat.chatName
//             : chat.users.find((u) => u._id !== userId)?.fullName}
//         </h5>
//       </div>

//       <div
//         className="flex-grow-1 overflow-auto p-3"
//         style={{ backgroundColor: "#f8f9fa" }}
//       >
//         <ListGroup>
//           {messages.map((msg) => (
//             <ListGroup.Item
//               key={msg._id}
//               className={msg.sender._id === userId ? "text-end" : "text-start"}
//             >
//               <small>
//                 <b>{msg.sender.fullName || msg.sender.username}</b>
//               </small>
//               <p>{msg.content}</p>
//               <small className="text-muted">
//                 {new Date(msg.createdAt).toLocaleTimeString()}
//               </small>
//             </ListGroup.Item>
//           ))}
//           <div ref={messagesEndRef} />
//         </ListGroup>
//       </div>

//       <Form
//         onSubmit={(e) => {
//           e.preventDefault();
//           sendMessage();
//         }}
//         className="p-3 border-top"
//       >
//         <InputGroup>
//           <FormControl
//             placeholder="Type your message..."
//             value={newMsg}
//             onChange={(e) => setNewMsg(e.target.value)}
//           />
//           <Button type="submit" variant="primary">
//             Send
//           </Button>
//         </InputGroup>
//       </Form>
//     </div>
//   );
// };

// const StartChatModal = ({
//   show,
//   onHide,
//   searchTerm,
//   setSearchTerm,
//   onSearch,
//   searchResults,
//   onCreateChat,
// }) => {
//   return (
//     <Modal show={show} onHide={onHide}>
//       <Modal.Header closeButton>
//         <Modal.Title>Start New Chat</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <InputGroup className="mb-3">
//           <FormControl
//             placeholder="Search users by name or username"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && onSearch(searchTerm)}
//           />
//           <Button onClick={() => onSearch(searchTerm)}>Search</Button>
//         </InputGroup>

//         <ListGroup>
//           {searchResults.length === 0 && <p>No users found</p>}
//           {searchResults.map((user) => (
//             <ListGroup.Item
//               key={user._id}
//               action
//               onClick={() => onCreateChat(user._id)}
//             >
//               {user.fullName || user.username}
//             </ListGroup.Item>
//           ))}
//         </ListGroup>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default ChatWindow;



import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Form,
  ListGroup,
  Modal,
  InputGroup,
  FormControl,
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chat?._id) {
      fetchMessages(chat._id);
      socket.emit("join-chat", chat._id);

      socket.on("receive-message", (msg) => {
        if (msg.chat === chat._id) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    }

    return () => {
      socket.off("receive-message");
    };
  }, [chat]);

  const fetchMessages = async (chatId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${chatId}`
      );
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to fetch messages", err);
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
    setMessages((prev) => [
      ...prev,
      {
        ...data,
        _id: Date.now(),
        sender: { _id: userId },
        createdAt: new Date(),
      },
    ]);
    setNewMsg("");
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/user/search", {
        search: searchTerm.trim(),
      });
      setSearchResults(res.data.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("User search failed", error);
    }
  };

  const handleCreateChat = async (otherUserId) => {
    
const userId = JSON.parse(localStorage.getItem('user'));
const currentotherUserId = otherUserId._id; // Ensure we get the ID from the selected user object
const currentUserId = userId.id; // Create an object with the ID  

    console.log("UserId:", userId.id); // Log the current user ID
  console.log("OtherUserId:", otherUserId._id);
  try {
    const res = await axios.post("http://localhost:5000/api/chat/create", {
      currentUserId,
      currentotherUserId,
    });
    onStartNewChat(res.data); // Handle the new chat if it's created
    setShowStartChatModal(false); // Close the modal
    setSearchTerm(""); // Clear search term
    setSearchResults([]); // Clear search results
  } catch (err) {
    console.error("Create chat failed", err.response?.data || err);
  }
};


  if (!chat) {
    return (
      <div className="d-flex flex-column h-100 justify-content-center align-items-center">
        <p>No chat selected</p>
        <Button onClick={() => setShowStartChatModal(true)}>
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
        />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="border-bottom p-3">
        <h5>
          {chat.isGroupChat
            ? chat.chatName
            : chat.users.find((u) => u._id !== userId)?.fullName}
        </h5>
      </div>

      <div
        className="flex-grow-1 overflow-auto p-3"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <ListGroup>
          {messages.map((msg) => (
            <ListGroup.Item
              key={msg._id}
              className={msg.sender._id === userId ? "text-end" : "text-start"}
            >
              <small>
                <b>{msg.sender.fullName || msg.sender.username}</b>
              </small>
              <p>{msg.content}</p>
              <small className="text-muted">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </small>
            </ListGroup.Item>
          ))}
          <div ref={messagesEndRef} />
        </ListGroup>
      </div>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-3 border-top"
      >
        <InputGroup>
          <FormControl
            placeholder="Type your message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
          />
          <Button type="submit" variant="primary">
            Send
          </Button>
        </InputGroup>
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
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Start New Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search users by name or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(searchTerm)}
          />
          <Button onClick={() => onSearch(searchTerm)}>Search</Button>
        </InputGroup>

        <ListGroup>
          {searchResults.length === 0 && <p>No users found</p>}
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
      </Modal.Body>
    </Modal>
  );
};

export default ChatWindow;
