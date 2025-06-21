import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import socket from "../socket"; // Your socket.io client instance
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

const VoiceCall = forwardRef(({ userId, remoteUserId, localUser, remoteUser, onClose }, ref) => {
  const localAudio = useRef();
  const remoteAudio = useRef();
  const pc = useRef(null);

  const [callStarted, setCallStarted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  // Allow parent to call stopMedia via ref
  useImperativeHandle(ref, () => ({
    stopMedia,
  }));

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
      if (remoteAudio.current) {
        remoteAudio.current.srcObject = event.streams[0];
      }
    };

    // Listen for incoming call offers
    socket.on("voice-call-offer", ({ offer, from, caller }) => {
      console.log("Incoming voice call offer from:", from, caller);
      setIncomingCall({ offer, from, caller });
    });

    // Listen for answer to our offer
    socket.on("voice-call-answer", async ({ answer }) => {
      try {
        await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStarted(true);
      } catch (err) {
        console.error("Error setting remote description on answer:", err);
      }
    });

    // Listen for ICE candidates from remote peer
    socket.on("voice-ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      }
    });

    // Call rejected by remote
    socket.on("voice-call-rejected", () => {
      alert("Call was rejected by the other user.");
      hangUp();
    });

    return () => {
      socket.off("voice-call-offer");
      socket.off("voice-call-answer");
      socket.off("voice-ice-candidate");
      socket.off("voice-call-rejected");
      if (pc.current) pc.current.close();
    };
  }, [remoteUserId]);

  // Start outgoing call
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
      if(localAudio.current) localAudio.current.srcObject = stream;
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.emit("voice-call", {
        to: remoteUserId,
        offer,
        from: userId,
        caller: {
          fullName: localUser?.fullName,
          username: localUser?.username,
          profilePhoto: localUser?.profilePhoto,
        },
      });
      setCallStarted(true);
    } catch (err) {
      alert("Microphone not found or permission denied.");
      console.error(err);
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      await pc.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
      if(localAudio.current) localAudio.current.srcObject = stream;
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("voice-answer", { to: incomingCall.from, answer });
      setCallStarted(true);
      setIncomingCall(null);
    } catch (err) {
      alert("Failed to accept call.");
      console.error(err);
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("voice-call-reject", { to: incomingCall.from });
    }
    setIncomingCall(null);
    stopMedia();
    onClose && onClose();
  };

  const stopMedia = () => {
    if (localAudio.current?.srcObject) {
      localAudio.current.srcObject.getTracks().forEach((track) => track.stop());
      localAudio.current.srcObject = null;
    }
    if (remoteAudio.current?.srcObject) {
      remoteAudio.current.srcObject.getTracks().forEach((track) => track.stop());
      remoteAudio.current.srcObject = null;
    }
  };

  // Hang up the call
  const hangUp = () => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    stopMedia();
    onClose && onClose();
  };

  return (
    <div style={overlayStyle}>
      <button style={closeBtnStyle} onClick={hangUp} title="Close">
        &times;
      </button>

      {/* Incoming call UI */}
      {incomingCall ? (
        <div
          style={{
            background: "#222",
            padding: 32,
            borderRadius: 16,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10001,
          }}
        >
          <div style={{ marginBottom: 16, fontSize: 22, fontWeight: 600 }}>Incoming Call</div>
          {incomingCall.caller?.profilePhoto ? (
            <img
              src={incomingCall.caller.profilePhoto}
              alt="Caller"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                marginBottom: 12,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                marginBottom: 12,
              }}
            >
              {incomingCall.caller?.fullName?.[0] ||
                incomingCall.caller?.username?.[0] ||
                "?"}
            </div>
          )}
          <div style={{ marginBottom: 24, fontSize: 18 }}>
            {incomingCall.caller?.fullName ||
              incomingCall.caller?.username ||
              "Unknown"}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={acceptCall}
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Accept
            </button>
            <button
              onClick={rejectCall}
              style={{
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Default Voice Call UI */}
          <div
            style={{
              color: "#fff",
              marginBottom: 24,
              fontSize: 28,
              fontWeight: 600,
              textAlign: "center",
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
                  textAlign: "center",
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
                  textAlign: "center",
                  width: "100%",
                  display: "block",
                }}
              >
                {remoteUser?.fullName || remoteUser?.username || "Caller"}
              </span>
            </div>
          </div>

          {/* Local and Remote audio elements, hidden */}
          <audio ref={localAudio} autoPlay muted />
          <audio ref={remoteAudio} autoPlay />

          {/* Controls */}
          {!callStarted ? (
            <button
              onClick={startCall}
              style={{
                width: "320px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 32,
                padding: "14px 48px",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              Start Call
            </button>
          ) : (
            <button
              onClick={hangUp}
              style={{
                width: "320px",
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                borderRadius: 32,
                padding: "14px 48px",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              Hang Up
            </button>
          )}
        </>
      )}
    </div>
  );
});

export default VoiceCall;
