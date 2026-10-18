import React from "react";

export const SUGGESTED_PROMPTS = [
  "What is AfriRamp?",
  "Who is AfriRamp designed for?",
  "How can freelancers manage international payment challenges?",
  "What should I do if my payment is delayed?",
];

export default function SuggestedPrompts({ onSelect, disabled }) {
  return (
    <div className="suggested-prompts" aria-label="Suggested questions">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          className="suggested-prompt"
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
        >
          <span>{prompt}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 10h10m-4-4 4 4-4 4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
