import React from "react";

const STATUS_COPY = {
  checking: "Checking API",
  online: "API reachable",
  offline: "API unreachable",
  not_configured: "API URL needed",
};

export default function ConnectionStatus({ status, onCheck }) {
  return (
    <div className="connection-status">
      <span
        className={`connection-dot connection-dot-${status}`}
        aria-hidden="true"
      />
      <span
        className="connection-label"
        aria-live="polite"
        title={
          status === "online"
            ? "The health endpoint is reachable; model inference has not been verified."
            : undefined
        }
      >
        {STATUS_COPY[status]}
      </span>
      <button
        className="status-recheck"
        type="button"
        onClick={onCheck}
        disabled={status === "checking"}
        aria-label="Check API connection again"
        title="Check API connection again"
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
      </button>
    </div>
  );
}
