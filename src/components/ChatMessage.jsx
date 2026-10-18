import React from "react";

function AssistantMark() {
  return (
    <span className="assistant-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="m6 17 6-11 6 11M8.5 12.7h7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );
}

export default function ChatMessage({ message, onRetry, disabled }) {
  const isUser = message.role === "user";
  const isPending = message.status === "pending";
  const isError = message.status === "error";

  return (
    <article className={`message message-${message.role}`}>
      {!isUser && <AssistantMark />}
      <div className="message-body">
        <p className="message-author">{isUser ? "You" : "AfriRamp assistant"}</p>
        {isPending ? (
          <div
            className="thinking-bubble"
            role="status"
            aria-label="Assistant is thinking"
          >
            <span />
            <span />
            <span />
          </div>
        ) : (
          <div className={`message-content${isError ? " message-error" : ""}`}>
            {message.content}
          </div>
        )}
        {isError && (
          <button
            className="retry-button"
            type="button"
            onClick={() => onRetry(message)}
            disabled={disabled}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <path
                d="M16 9a6 6 0 0 0-10.2-3L4 7.8M4 4v3.8h3.8M4 11a6 6 0 0 0 10.2 3L16 12.2M16 16v-3.8h-3.8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            Retry response
          </button>
        )}
      </div>
      {isUser && (
        <span className="user-avatar" aria-hidden="true">
          Y
        </span>
      )}
    </article>
  );
}
