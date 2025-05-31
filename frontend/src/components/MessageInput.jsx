// components/MessageInput.js
import React from "react";
import { Form, FormControl, Button } from "react-bootstrap";
import { Paperclip, EmojiSmile, Send } from "react-bootstrap-icons";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({
  newMsg,
  setNewMsg,
  sendMessage,
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
    <div className="chat-input rounded-3 shadow-sm d-flex w-100 align-items-center" style={{ position: "relative" }}>
      <div className="input-wrapper me-2 w-100">
        <FormControl
          as="input"
          placeholder="Message"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="border-0 shadow-none px-2 py-1"
        />
      </div>

      <div className="d-flex align-items-center icon-group">
        <Button variant="link" className="icon-btn p-0" type="button">
          <Paperclip size={20} />
        </Button>

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
            <div style={{ position: "absolute", bottom: "40px", right: 300, zIndex: 1000 }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <Button variant="link" className="icon-btn submit-icon p-0" type="submit">
          <Send size={20} />
        </Button>
      </div>
    </div>
  </Form>
);

export default MessageInput;
