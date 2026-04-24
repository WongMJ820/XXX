"use client";

import { useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  inputValue: string;
  attachedFile: File | null;
  onInputChange: (val: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatPanel({
  messages,
  isTyping,
  inputValue,
  attachedFile,
  onInputChange,
  onFileSelect,
  onSubmit,
}: ChatPanelProps) {
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="user-info">
          <div className="avatar">
            <i className="fa-solid fa-robot fa-xl" style={{ color: "white" }}></i>
            <span className="status-dot"></span>
          </div>
          <div>
            <h4>Financial Strategist</h4>
            <p>Always active</p>
          </div>
        </div>
      </div>

      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <div className="bubble">{msg.text}</div>
            <span className="timestamp">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      <div className={`typing-indicator ${isTyping ? "visible" : ""}`}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.csv,.xlsx"
          style={{ display: "none" }}
          onChange={onFileSelect}
        />
        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <i
            className={`fa-solid ${
              attachedFile ? "fa-file-circle-check" : "fa-paperclip"
            }`}
            style={attachedFile ? { color: "#956ae6" } : undefined}
          ></i>
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type a message or upload..."
          autoComplete="off"
        />
        <button type="submit" className="send-btn">
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}
