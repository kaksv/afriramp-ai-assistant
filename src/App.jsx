import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatInput, { MAX_MESSAGE_LENGTH } from "./components/ChatInput.jsx";
import ChatMessage from "./components/ChatMessage.jsx";
import ConnectionStatus from "./components/ConnectionStatus.jsx";
import SuggestedPrompts from "./components/SuggestedPrompts.jsx";
import { ApiError, checkApiHealth, sendChatMessage } from "./services/api.js";

function createId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getHealthState(error) {
  return error instanceof ApiError && error.code === "not_configured"
    ? "not_configured"
    : "offline";
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [connectionState, setConnectionState] = useState("checking");
  const conversationRef = useRef(null);
  const bottomRef = useRef(null);
  const shouldStickToBottom = useRef(true);
  const requestInFlight = useRef(false);

  const runHealthCheck = useCallback(async (signal) => {
    setConnectionState("checking");
    try {
      await checkApiHealth({ signal });
      setConnectionState("online");
    } catch (error) {
      if (signal?.aborted) return;
      setConnectionState(getHealthState(error));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void runHealthCheck(controller.signal);
    return () => controller.abort();
  }, [runHealthCheck]);

  useEffect(() => {
    if (!shouldStickToBottom.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    bottomRef.current?.scrollIntoView({
      block: "end",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages]);

  function handleConversationScroll() {
    const container = conversationRef.current;
    if (!container) return;
    shouldStickToBottom.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;
  }

  async function requestReply(question, replyId) {
    try {
      const reply = await sendChatMessage(question);
      setMessages((current) =>
        current.map((message) =>
          message.id === replyId
            ? { ...message, content: reply, status: "complete" }
            : message,
        ),
      );
    } catch (error) {
      const friendlyMessage =
        error instanceof ApiError
          ? error.message
          : "The assistant could not respond. Please try again.";
      setMessages((current) =>
        current.map((message) =>
          message.id === replyId
            ? { ...message, content: friendlyMessage, status: "error" }
            : message,
        ),
      );
    } finally {
      requestInFlight.current = false;
      setIsSending(false);
    }
  }

  function submitQuestion(question = input) {
    const cleanedQuestion = question.trim();
    if (
      requestInFlight.current ||
      !cleanedQuestion ||
      cleanedQuestion.length > MAX_MESSAGE_LENGTH
    ) {
      return;
    }

    requestInFlight.current = true;
    setIsSending(true);
    setInput("");
    shouldStickToBottom.current = true;
    const userId = createId();
    const replyId = createId();

    setMessages((current) => [
      ...current,
      { id: userId, role: "user", content: cleanedQuestion },
      {
        id: replyId,
        role: "assistant",
        content: "",
        status: "pending",
        question: cleanedQuestion,
      },
    ]);
    void requestReply(cleanedQuestion, replyId);
  }

  function retryMessage(message) {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setIsSending(true);
    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? { ...item, content: "", status: "pending" }
          : item,
      ),
    );
    void requestReply(message.question, message.id);
  }

  function startNewConversation() {
    if (requestInFlight.current) return;
    setMessages([]);
    setInput("");
    shouldStickToBottom.current = true;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="AfriRamp assistant">
        <ChatHeader
          onNewChat={startNewConversation}
          disabled={isSending}
        />
        <div className="sidebar-intro">
          <span className="sidebar-kicker">A clearer way to ask</span>
          <p>
            An informational guide to AfriRamp and the payment challenges
            freelancers face.
          </p>
        </div>
        <div className="sidebar-footer">
          <span className="sidebar-footer-icon" aria-hidden="true">i</span>
          <p>
            Prototype only. AfriRamp does not process payments or connect to
            banks.
          </p>
        </div>
      </aside>

      <main className="workspace">
        <div className="mobile-header">
          <ChatHeader
            compact
            onNewChat={startNewConversation}
            disabled={isSending}
          />
        </div>

        <header className="workspace-header">
          <div className="workspace-heading">
            <p className="workspace-eyebrow">YOUR ASSISTANT</p>
            <h1>AfriRamp, explained.</h1>
          </div>
          <ConnectionStatus
            status={connectionState}
            onCheck={() => void runHealthCheck()}
          />
        </header>

        <section
          className="conversation"
          aria-label="Conversation"
          ref={conversationRef}
          onScroll={handleConversationScroll}
        >
          <div
            className="conversation-content"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-busy={isSending}
          >
            {messages.length === 0 ? (
              <div className="welcome">
                <div className="welcome-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path
                      d="M8 22.5 16 8l8 14.5M11.3 16.5h9.4M20.4 22.5l3.6-6.7"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <circle cx="24" cy="15.8" r="2" fill="currentColor" />
                  </svg>
                </div>
                <p className="welcome-eyebrow">AFRIRAMP AI ASSISTANT</p>
                <h2>What would you like to understand?</h2>
                <p className="welcome-copy">
                  Ask about the AfriRamp concept, or get context on international
                  payment challenges faced by African freelancers.
                </p>
                <SuggestedPrompts
                  onSelect={submitQuestion}
                  disabled={isSending}
                />
                <p className="prototype-note">
                  Informational prototype · Responses are AI-generated and
                  should be verified.
                </p>
              </div>
            ) : (
              <div className="message-list">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onRetry={retryMessage}
                    disabled={isSending}
                  />
                ))}
                <div ref={bottomRef} aria-hidden="true" />
              </div>
            )}
          </div>
        </section>

        <footer className="composer-area">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => submitQuestion()}
            disabled={isSending}
          />
          <p className="composer-disclaimer">
            AI responses can be inaccurate. Verify important information and
            don’t share sensitive details.
          </p>
        </footer>
      </main>
    </div>
  );
}
