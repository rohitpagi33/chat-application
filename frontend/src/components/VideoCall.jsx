import React, { useRef, useEffect, useState } from "react";
import socket from "../socket";

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
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
      localVideo.current.srcObject = stream;
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("video-answer", { to: from, answer });
      setCallStarted(true);
    });

    socket.on("video-call-answer", async ({ answer }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      setCallStarted(true);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
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

  return (
    <div style={{ background: "#222", padding: 20, borderRadius: 10 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <video ref={localVideo} autoPlay muted style={{ width: 200, background: "#000" }} />
        <video ref={remoteVideo} autoPlay style={{ width: 200, background: "#000" }} />
      </div>
      {!callStarted && (
        <button onClick={startCall} style={{ marginTop: 10 }}>Start Call</button>
      )}
      <button onClick={onClose} style={{ marginTop: 10, marginLeft: 10 }}>Close</button>
    </div>
  );
};

export default VideoCall;