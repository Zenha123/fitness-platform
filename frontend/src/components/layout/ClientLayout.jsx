import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import BottomTabBar from "./BottomTabBar";

/* ─── Nav Config ───────────────────────────────────────────────────────────── */
const navLinks = [
  {
    name: "Home",
    path: "/client/dashboard",
    matchPaths: ["/client/dashboard"],
    icon: HomeIcon,
  },
  {
    name: "Progress",
    path: "/client/progress",
    matchPaths: ["/client/progress"],
    icon: ProgressIcon,
  },
  {
    name: "Strength",
    path: "/client/strength",
    matchPaths: ["/client/strength"],
    icon: StrengthIcon,
  },
  {
    name: "Coach",
    path: "/client/reviews",
    matchPaths: ["/client/reviews"],
    icon: CoachIcon,
  },
];

/* ─── Helper: is this link active ─────────────────────────────────────────── */
function isLinkActive(link, pathname) {
  return link.matchPaths
    ? link.matchPaths.some((p) => pathname.startsWith(p))
    : pathname === link.path;
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function ClientLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Prevent background scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "C";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] overflow-x-hidden">

      {/* ── Sticky Top Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] shadow-[var(--shadow-sm)]">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/client/dashboard"
            className="flex items-center gap-2.5 group flex-shrink-0"
            aria-label="FitCoach home"
          >
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-ink)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg tracking-tight text-[var(--color-ink)] font-display uppercase select-none">
              Fit<span className="text-[var(--color-signal)]">Coach</span>
            </span>
          </Link>

          {/* Desktop inline nav — md+ */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Client navigation">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link, location.pathname);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-md)] text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-ink)] text-white shadow-sm"
                      : "text-[var(--color-steel)] hover:text-[var(--color-ink)] hover:bg-black/5"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side: profile + actions */}
          <div className="flex items-center gap-3">
            {/* User info — md+ */}
            <div className="hidden md:flex items-center gap-2.5 text-right">
              <div>
                <p className="text-sm font-bold text-[var(--color-ink)] leading-tight">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-steel)]">Member</p>
              </div>
              <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-border)] font-bold text-sm flex items-center justify-center select-none">
                {initials}
              </div>
            </div>

            {/* Sign out — desktop */}
            <Button variant="ghost" size="sm" onClick={logout} className="hidden md:inline-flex">
              Sign out
            </Button>

            {/* Hamburger — visible below md */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="md:hidden p-2 rounded-[var(--radius-md)] text-[var(--color-steel)] hover:bg-black/5 hover:text-[var(--color-ink)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)]"
              aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={drawerOpen}
              aria-controls="client-mobile-drawer"
            >
              {drawerOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Backdrop ────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-[var(--color-ink)]/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Slide-in Drawer ────────────────────────────────────────── */}
      <div
        id="client-mobile-drawer"
        className={`fixed top-16 bottom-0 right-0 w-72 bg-white border-l border-[var(--color-border)] z-50 md:hidden flex flex-col transition-transform duration-300 ease-out shadow-[var(--shadow-2xl)] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Client navigation drawer"
      >
        {/* Drawer header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-border)] font-bold flex items-center justify-center select-none">
            {initials}
          </div>
          <div>
            <p className="font-bold text-[var(--color-ink)] text-sm leading-tight">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold text-[var(--color-steel)]">Member Account</p>
          </div>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link, location.pathname);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-[var(--color-steel)] hover:text-[var(--color-ink)] hover:bg-black/5"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="px-3 py-4 border-t border-[var(--color-border)]">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => { setDrawerOpen(false); logout(); }}
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      {/*
        On mobile (< md): add bottom padding to clear the fixed bottom tab bar.
        On desktop (md+): normal padding, no bottom bar.
      */}
      <main
        className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8 page-enter"
        style={{ minWidth: 0 }}
      >
        {children}
      </main>

      {/* ── Mobile Bottom Tab Bar ──────────────────────────────────────────── */}
      {/* Client gets 4 tabs: Home, Progress, Strength, Coach */}
      <BottomTabBar tabs={navLinks} />

    </div>
  );
}

/* ─── SVG Icon Components ──────────────────────────────────────────────────── */
function BoltIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
  );
}

function HomeIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function ProgressIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function StrengthIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function CoachIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
