import React from "react";
import { FileEarmarkPdf, FileEarmark } from "react-bootstrap-icons";

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = nowOnly - dateOnly;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
    });
  }
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function renderFile(file) {
  if (!file?.url) return null;
  const ext = file.name?.split(".").pop().toLowerCase();

  const fileBoxStyle = {
    background: "#f8f9fa",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 12,
    wordBreak: "break-all",
  };

  const fileNameStyle = {
    color: "#222",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: 2,
    textDecoration: "none",
  };

  if (file.type?.startsWith("image/")) {
    return (
      <div style={fileBoxStyle}>
        <a href={file.url} target="_blank" rel="noopener noreferrer" style={{width: "20%"}}>
          <img
            src={file.url}
            alt={file.name}
            style={{
              maxWidth: 80,
              maxHeight: 80,
              borderRadius: 6,
              border: "1px solid #eee",
              marginRight: 10,
            }}
          />
        </a>
        <div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            style={fileNameStyle}
          >
            {file.name}
          </a>
          <div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="small text-primary"
              style={{ textDecoration: "underline" }}
            >
              View Image
            </a>
          </div>
        </div>
      </div>
    );
  }
  if (ext === "pdf") {
    return (
      <div style={fileBoxStyle}>
        <FileEarmarkPdf size={36} className="me-2 text-danger" style={{width: "auto"}} />
        <div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            style={fileNameStyle}
          >
            {file.name}
          </a>
          <div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="small text-primary"
              style={{ textDecoration: "underline" }}
            >
              Open PDF
            </a>
          </div>
        </div>
      </div>
    );
  }
  if (["ppt", "pptx"].includes(ext)) {
    return (
      <div style={fileBoxStyle}>
        <FileEarmark size={36} className="me-2 text-warning" />
        <div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            style={fileNameStyle}
          >
            {file.name}
          </a>
          <div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="small text-primary"
              style={{ textDecoration: "underline" }}
            >
              Open Presentation
            </a>
          </div>
        </div>
      </div>
    );
  }
  // Generic file
  return (
    <div style={fileBoxStyle}>
      <FileEarmark size={36} className="me-2 text-secondary" />
      <div>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          style={fileNameStyle}
        >
          {file.name}
        </a>
        <div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="small text-primary"
            style={{ textDecoration: "underline" }}
          >
            Open File
          </a>
        </div>
      </div>
    </div>
  );
}