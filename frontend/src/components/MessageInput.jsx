import React from "react";
import { Button, Form, FormControl } from "react-bootstrap";
import { Paperclip, EmojiSmile, Send } from "react-bootstrap-icons";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({
  newMsg,
  setNewMsg,
  sendMessage,
  uploading,
  fileInputRef,
  handleFileChange,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
}) => (
  <Form
    onSubmit={(e) => {
      e.preventDefault();
      sendMessage();
    }}
    className="p-3 border-0 bg-transparent"
  >
    <div
      className="chat-input rounded-3 shadow-sm d-flex w-100 align-items-center"
      style={{ position: "relative" }}
    >
      <div className="input-wrapper me-2">
        <FormControl
          as="input"
          placeholder="Message"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="border-0 shadow-none w-100 px-2 py-1"
          disabled={uploading}
        />
      </div>
      <div className="d-flex align-items-center justify-content-between icon-group">
        <Button
          variant="link"
          className="icon-btn p-0"
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          title="Attach file"
        >
          <Paperclip size={20} />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
        />
        <div style={{ position: "relative" }}>
          <Button
            variant="link"
            className="icon-btn p-0"
            type="button"
            onClick={() => setShowEmojiPicker((v) => !v)}
          >
            <EmojiSmile size={18} />
          </Button>
          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                scrollbarWidth: "none",
                bottom: "40px",
                right: 325,
                zIndex: 1000,
                msOverflowStyle: "none",
              }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <Button
          variant="link"
          className="icon-btn submit-icon p-0"
          type="submit"
          disabled={uploading}
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  </Form>
);

export default MessageInput;