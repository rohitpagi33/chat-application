import React, { useRef, useEffect, useState } from "react";
import socket from "../socket";

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
  top: 5,
  left: 500,
  fontSize: 32,
  color: "#fff",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  zIndex: 10001,
};

const VideoCall = ({ userId, remoteUserId, onClose }) => {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const pc = useRef(null);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: remoteUserId, candidate: event.candidate });
      }
    };

    pc.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    socket.on("video-call-offer", async ({ offer, from }) => {
      await pc.current.setRemoteDescription(new window.RTCSessionDescription(offer));
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
      localVideo.current.srcObject = stream;
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("video-answer", { to: from, answer });
      setCallStarted(true);
    });

    socket.on("video-call-answer", async ({ answer }) => {
      await pc.current.setRemoteDescription(new window.RTCSessionDescription(answer));
      setCallStarted(true);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await pc.current.addIceCandidate(new window.RTCIceCandidate(candidate));
        } catch (e) {}
      }
    });

    return () => {
      socket.off("video-call-offer");
      socket.off("video-call-answer");
      socket.off("ice-candidate");
      pc.current && pc.current.close();
    };
  }, [remoteUserId]);

  // To start a call
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
      localVideo.current.srcObject = stream;
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit("video-call", { to: remoteUserId, offer, from: userId });
    } catch (err) {
      alert("Camera or microphone not found or not allowed.");
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
          display: "flex",
          gap: 24,
          alignItems: "center",
          justifyContent: "center",
          width: "100vw",
          height: "80vh",
        }}
      >
        <video
          ref={remoteVideo}
          autoPlay
          style={{
            width: "60vw",
            height: "70vh",
            background: "#000",
            borderRadius: 16,
            objectFit: "cover",
            boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
          }}
        />
        <video
          ref={localVideo}
          autoPlay
          muted
          style={{
            width: "20vw",
            height: "20vh",
            background: "#222",
            borderRadius: 12,
            objectFit: "cover",
            position: "absolute",
            bottom: 40,
            right: 40,
            border: "3px solid #1976d2",
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      {!callStarted && (
        <button
          onClick={startCall}
          style={{
            marginTop: 24,
            padding: "12px 32px",
            fontSize: 18,
            borderRadius: 8,
            background: "#1976d2",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          Start Call
        </button>
      )}
      {callStarted && (
        <button
          onClick={hangUp}
          style={{
            marginTop: 24,
            padding: "12px 32px",
            fontSize: 18,
            borderRadius: 8,
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          Hang Up
        </button>
      )}
    </div>
  );
};

export default VideoCall;