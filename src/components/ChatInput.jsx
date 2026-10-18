import React from "react";

export const MAX_MESSAGE_LENGTH = 2000;

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}) {
  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      aria-busy={disabled}
    >
      <label className="visually-hidden" htmlFor="chat-message">
        Message the AfriRamp assistant
      </label>
      <textarea
        id="chat-message"
        className="composer-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about AfriRamp…"
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        disabled={disabled}
        aria-describedby="composer-hint composer-count"
      />
      <div className="composer-actions">
        <p className="composer-hint" id="composer-hint">
          Enter to send · Shift+Enter for newline
        </p>
        <span className="composer-count" id="composer-count" aria-live="off">
          {value.length}/{MAX_MESSAGE_LENGTH}
        </span>
        <button
          className="send-button"
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          {disabled ? (
            <span className="send-spinner" aria-hidden="true" />
          ) : (
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 15V5m-4 4 4-4 4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
