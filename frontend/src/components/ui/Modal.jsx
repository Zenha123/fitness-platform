import React, { useEffect } from "react";
import { Button } from "./Button";

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[var(--color-ink)]/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Panel */}
      <div 
        className={`relative w-full ${maxWidth} bg-[var(--color-white)] rounded-[var(--radius-xl)] shadow-[var(--shadow-2xl)] animate-slide-up flex flex-col max-h-[90vh]`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-steel-light)]">
          <h2 id="modal-title" className="text-xl text-[var(--color-ink)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-steel)] hover:text-[var(--color-ink)] transition-colors p-1 rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--color-steel-light)] bg-[var(--color-paper)]/50 flex justify-end gap-3 rounded-b-[var(--radius-xl)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
