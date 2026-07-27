import React from "react";
import { Alert } from "./Alert";

export function Toast({ message, variant = "info", onClose, isVisible = true }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[var(--z-toast)] min-w-[300px] max-w-sm animate-slide-up">
      <Alert variant={variant} className="shadow-lg pr-12 relative">
        {message}
        <button
          onClick={onClose}
          className="absolute right-3 top-4 text-inherit opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </Alert>
    </div>
  );
}
