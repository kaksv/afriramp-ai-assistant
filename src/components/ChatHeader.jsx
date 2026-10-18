import React from "react";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M8 22.5 16 8l8 14.5M11.3 16.5h9.4M20.4 22.5l3.6-6.7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <circle cx="24" cy="15.8" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function ChatHeader({ onNewChat, disabled, compact = false }) {
  return (
    <div className={`chat-brand${compact ? " chat-brand-compact" : ""}`}>
      <div className="brand-lockup">
        <BrandMark />
        <div>
          <p className="brand-name">AfriRamp</p>
          <p className="brand-tag">AI assistant</p>
        </div>
      </div>
      <button
        className="new-chat-button"
        type="button"
        onClick={onNewChat}
        disabled={disabled}
        aria-label="Start a new conversation"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 4v12M4 10h12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
        <span>{compact ? "New chat" : "New conversation"}</span>
      </button>
    </div>
  );
}
