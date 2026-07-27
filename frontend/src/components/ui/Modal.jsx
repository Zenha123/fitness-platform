import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

/**
 * Modal — Universal portal-based responsive dialog component.
 *
 * Behaviour:
 *  - Uses ReactDOM.createPortal to render directly into document.body,
 *    bypassing all container CSS transforms and stacking contexts.
 *  - Centered on desktop (sm+), sheet-style slide-up on mobile (< sm).
 *  - Scrollable inner body that never overflows viewport.
 *  - Locks document.body scroll while open.
 *  - Closes on backdrop click or Escape key.
 *  - High z-index (z-[100]) to overlay all navigation layers.
 */
export function Modal({ isOpen, onClose, title, children, footer, stickyHeader, maxWidth = "max-w-lg" }) {
  const panelRef = useRef(null);

  /* ── Body scroll lock ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ── Escape key close ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="presentation"
    >
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-[var(--color-ink)]/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal Panel ───────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className={[
          "relative w-full bg-[var(--color-white)] shadow-[var(--shadow-2xl)] flex flex-col z-10",
          "animate-slide-up overflow-hidden",
          /* Mobile: slide-up sheet, full width, rounded top */
          "rounded-t-[var(--radius-2xl)] max-h-[90dvh]",
          /* Desktop: centered card, max height 85vh */
          `sm:rounded-[var(--radius-2xl)] sm:${maxWidth} sm:max-h-[85vh] sm:mx-auto`,
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-white)] relative">
          {/* Mobile drag handle indicator */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[var(--color-steel-light)] sm:hidden"
            aria-hidden="true"
          />
          <h2
            id="modal-title"
            className="text-lg sm:text-xl font-display uppercase tracking-wider text-[var(--color-ink)] pr-2 mt-1 sm:mt-0"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[var(--color-steel)] hover:text-[var(--color-ink)] hover:bg-black/5 transition-colors p-1.5 rounded-[var(--radius-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)]"
            aria-label="Close dialog"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Sticky sub-header (search bar, filter chips, etc.) ────────── */}
        {stickyHeader && (
          <div className="flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-paper)]/50">
            {stickyHeader}
          </div>
        )}

        {/* ── Body (scrollable) ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {children}
        </div>

        {/* ── Footer (sticky action bar) ────────────────────────────────── */}
        {footer && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-paper)]/70 flex items-center justify-end gap-3 rounded-b-[var(--radius-2xl)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

/* ── Icon ───────────────────────────────────────────────────────────────── */
function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
