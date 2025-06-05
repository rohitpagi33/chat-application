import React, { useRef, useEffect, useState } from "react";
import socket from "../socket";
import { MdCall } from "react-icons/md";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(20, 24, 28, 0.97)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const closeBtnStyle = {
  position: "absolute",
  top: 24,
  left: 500,
  fontSize: 32,
  color: "#fff",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  zIndex: 10001,
};

function getInitials(user) {
  if (!user) return "?";
  if (user.fullName) return user.fullName[0].toUpperCase();
  if (user.username) return user.username[0].toUpperCase();
  return "?";
}

const VoiceCall = ({ userId, remoteUserId, localUser, remoteUser, onClose }) => {
  const localAudio = useRef();
  const remoteAudio = useRef();
  const pc = useRef(null);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("voice-ice-candidate", { to: remoteUserId, candidate: event.candidate });
      }
    };

    pc.current.ontrack = (event) => {
      remoteAudio.current.srcObject = event.streams[0];
    };

    socket.on("voice-call-offer", async ({ offer, from }) => {
      await pc.current.setRemoteDescription(new window.RTCSessionDescription(offer));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
      localAudio.current.srcObject = stream;
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("voice-answer", { to: from, answer });
      setCallStarted(true);
    });

    socket.on("voice-call-answer", async ({ answer }) => {
      await pc.current.setRemoteDescription(new window.RTCSessionDescription(answer));
      setCallStarted(true);
    });

    socket.on("voice-ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await pc.current.addIceCandidate(new window.RTCIceCandidate(candidate));
        } catch (e) {}
      }
    });

    return () => {
      socket.off("voice-call-offer");
      socket.off("voice-call-answer");
      socket.off("voice-ice-candidate");
      pc.current && pc.current.close();
    };
  }, [remoteUserId]);

  // To start a call
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
      localAudio.current.srcObject = stream;
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit("voice-call", { to: remoteUserId, offer, from: userId });
    } catch (err) {
      alert("Microphone not found or not allowed.");
    }
  };

  // Hang up: close peer connection and overlay
  const hangUp = () => {
    pc.current && pc.current.close();
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <button style={closeBtnStyle} onClick={hangUp} title="Close">
        &times;
      </button>
      <div
        style={{
          color: "#fff",
          marginBottom: 24,
          fontSize: 28,
          fontWeight: 600,
          textAlign: "center", // Center the title
          width: "100%",
        }}
      >
        Voice Call
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          marginBottom: 32,
        }}
      >
        {/* Local User */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {localUser?.profilePhoto ? (
            <img
              src={localUser.profilePhoto}
              alt={localUser.fullName || localUser.username}
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "3px solid #1976d2",
                objectFit: "cover",
                marginBottom: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#222",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                border: "3px solid #1976d2",
                marginBottom: 8,
              }}
            >
              {getInitials(localUser)}
            </div>
          )}
          <span
            style={{
              color: "#fff",
              fontSize: 16,
              opacity: 0.85,
              fontWeight: 500,
              textAlign: "center", // Center the name
              width: "100%",
              display: "block",
            }}
          >
            {localUser?.fullName || localUser?.username || "You"}
          </span>
        </div>

        {/* Neon Call Icon */}
        <div
          style={{
            background: "linear-gradient(135deg, #1976d2 60%, #00eaff 100%)",
            borderRadius: "50%",
            width: 90,
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 32px 8px #00eaff88, 0 0 0 8px #1976d244",
            position: "relative",
          }}
        >
          <MdCall size={48} color="#fff" style={{ filter: "drop-shadow(0 0 8px #00eaff)" }} />
        </div>

        {/* Remote User */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {remoteUser?.profilePhoto ? (
            <img
              src={remoteUser.profilePhoto}
              alt={remoteUser.fullName || remoteUser.username}
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "3px solid #1976d2",
                objectFit: "cover",
                marginBottom: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#222",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                border: "3px solid #1976d2",
                marginBottom: 8,
              }}
            >
              {getInitials(remoteUser)}
            </div>
          )}
          <span
            style={{
              color: "#fff",
              fontSize: 16,
              opacity: 0.85,
              fontWeight: 500,
              textAlign: "center", // Center the name
              width: "100%",
              display: "block",
            }}
          >
            {remoteUser?.fullName || remoteUser?.username || "User"}
          </span>
        </div>
      </div>
      <audio ref={remoteAudio} autoPlay style={{ width: "100%" }} />
      <audio ref={localAudio} autoPlay muted style={{ display: "none" }} />
      <div style={{ width: 320, margin: "0 auto" }}>
        {!callStarted ? (
          <button
            onClick={startCall}
            style={{
              width: "100%",
              padding: "14px 0",
              fontSize: 20,
              borderRadius: 12,
              background: "linear-gradient(90deg, #1976d2 60%, #00eaff 100%)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              letterSpacing: 1,
              boxShadow: "0 2px 16px #1976d288",
              marginTop: 8,
            }}
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={hangUp}
            style={{
              width: "100%",
              padding: "14px 0",
              fontSize: 20,
              borderRadius: 12,
              background: "linear-gradient(90deg, #d32f2f 60%, #ff1744 100%)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              letterSpacing: 1,
              boxShadow: "0 2px 16px #d32f2f88",
              marginTop: 8,
            }}
          >
            Hang Up
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceCall;