import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import socket from "../socket"; // Make sure this exports an active socket.io-client instance

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

const VideoCall = forwardRef(({ userId, remoteUserId, currentUser, onClose }, ref) => {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const pc = useRef(null);
  const [callStarted, setCallStarted] = useState(false);

  useImperativeHandle(ref, () => ({
    stopMedia,
  }));

  const stopMedia = () => {
    console.log("🛑 stopMedia called");
    if (localVideo.current?.srcObject) {
      localVideo.current.srcObject.getTracks().forEach(track => track.stop());
      localVideo.current.srcObject = null;
    }
    if (remoteVideo.current?.srcObject) {
      remoteVideo.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.current.srcObject = null;
    }
    pc.current?.close();
    pc.current = null;
  };

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    socket.on("video-call-offer", async ({ offer, from }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach(track => pc.current.addTrack(track, stream));
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
        } catch (e) {
          console.error("Failed to add ICE candidate", e);
        }
      }
    });

    socket.on("call-rejected", () => {
      stopMedia();
      onClose();
      window.location.reload();
    });

    return () => {
      stopMedia();
      socket.off("video-call-offer");
      socket.off("video-call-answer");
      socket.off("call-rejected");
      socket.off("ice-candidate");
    };
  }, [remoteUserId]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach(track => pc.current.addTrack(track, stream));
      localVideo.current.srcObject = stream;

      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);

      socket.emit("video-call", {
        to: remoteUserId,
        offer,
        from: userId,
        caller: {
          _id: userId,
          fullName: currentUser.fullName,
          username: currentUser.username,
          profilePhoto: currentUser.profilePhoto,
        },
      });
    } catch (err) {
      alert("Camera or microphone not available or not permitted.");
    }
  };

  const hangUp = () => {
    stopMedia();
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
          playsInline
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
          playsInline
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
            width: "320px",
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
            marginBottom: 8,
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Start Call
        </button>
      )}

      {callStarted && (
        <button
          onClick={hangUp}
          style={{
            width: "320px",
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
            marginBottom: 8,
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Hang Up
        </button>
      )}
    </div>
  );
});

export default VideoCall;
