import React, { useEffect, useRef } from "react";

/**
 * Modal — Universal responsive dialog component.
 *
 * Behaviour:
 *  - Centered on desktop (md+), sheet-style slide-up on mobile
 *  - Scrollable body that never overflows the viewport
 *  - Traps scroll on document body while open
 *  - Closes on backdrop click or Escape key
 *  - z-index 60 to sit above bottom tab bar (z-50) and drawer (z-50)
 *
 * Props:
 *  isOpen      boolean
 *  onClose     () => void
 *  title       string
 *  children    ReactNode   — scrollable body content
 *  footer      ReactNode   — optional sticky footer (action buttons)
 *  maxWidth    string      — Tailwind max-w class (default "max-w-lg")
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
    return () => { document.body.style.overflow = ""; };
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

  return (
    /* Portal-like fixed layer — z-60 clears sidebar (z-30), header (z-40), drawer/bottom-nav (z-50) */
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      role="presentation"
    >
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-[var(--color-ink)]/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal Panel ───────────────────────────────────────────────────── */}
      {/*
        Mobile  (< sm): slides up from bottom edge, full-width, rounded top corners only,
                        max-height = 92dvh so it never covers the full screen.
        Desktop (sm+):  centred card, rounded all corners, max-h = 90vh.
      */}
      <div
        ref={panelRef}
        className={[
          "relative w-full bg-[var(--color-white)] shadow-[var(--shadow-2xl)] flex flex-col",
          "animate-slide-up",
          /* Mobile: slide-up sheet */
          "rounded-t-[var(--radius-xl)] max-h-[92dvh]",
          /* Desktop: card */
          `sm:rounded-[var(--radius-xl)] sm:${maxWidth} sm:max-h-[90vh] sm:mx-4`,
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          {/* Drag handle on mobile */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[var(--color-border)] sm:hidden"
            aria-hidden="true"
          />
          <h2
            id="modal-title"
            className="text-xl text-[var(--color-ink)] pr-2"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[var(--color-steel)] hover:text-[var(--color-ink)] transition-colors p-1.5 rounded-[var(--radius-sm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)]"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Sticky sub-header (search bars, filter chips, etc.) ───────── */}
        {stickyHeader && (
          <div className="flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-paper)]/40">
            {stickyHeader}
          </div>
        )}

        {/* ── Body (scrollable) ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {children}
        </div>

        {/* ── Footer (sticky) ───────────────────────────────────────────── */}
        {footer && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-paper)]/60 flex items-center justify-end gap-3 rounded-b-[var(--radius-xl)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Icon ───────────────────────────────────────────────────────────────── */
function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
