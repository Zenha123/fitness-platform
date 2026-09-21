import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import BottomTabBar from "./BottomTabBar";

/* ─── Nav Config ───────────────────────────────────────────────────────────── */
const navLinks = [
  {
    name: "Roster",
    path: "/trainer/dashboard",
    matchPaths: ["/trainer/dashboard", "/trainer/clients"],
    icon: RosterIcon,
  },
  {
    name: "Schedule",
    path: "/trainer/schedule",
    matchPaths: ["/trainer/schedule"],
    icon: ScheduleIcon,
  },
  {
    name: "Exercises",
    path: "/trainer/exercises",
    matchPaths: ["/trainer/exercises"],
    icon: ExerciseIcon,
  },
  {
    name: "Bookings",
    path: "/trainer/bookings",
    matchPaths: ["/trainer/bookings"],
    icon: BookingsIcon,
  },
  {
    name: "Availability",
    path: "/trainer/availability",
    matchPaths: ["/trainer/availability"],
    icon: AvailabilityIcon,
  },
  {
    name: "Reports",
    path: "/trainer/reports",
    matchPaths: ["/trainer/reports"],
    icon: ReportsIcon,
  },
];

/* ─── Helper: is this link active ─────────────────────────────────────────── */
function isLinkActive(link, pathname) {
  return link.matchPaths
    ? link.matchPaths.some((p) => pathname.startsWith(p))
    : pathname === link.path;
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function TrainerLayout({ children }) {
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
    : "T";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] overflow-x-hidden">

      {/* ── Sticky Top Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] shadow-[var(--shadow-sm)]">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/trainer/dashboard"
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

          {/* Desktop nav label (lg+ sidebar handles the links) */}
          <span className="hidden lg:block text-xs font-bold text-[var(--color-steel)] uppercase tracking-wider">
            Trainer Workspace
          </span>

          {/* Right side: profile + actions */}
          <div className="flex items-center gap-3">
            {/* User info — md+ */}
            <div className="hidden md:flex items-center gap-2.5 text-right">
              <div>
                <p className="text-sm font-bold text-[var(--color-ink)] leading-tight">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-steel)]">Trainer</p>
              </div>
              <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-border)] font-bold text-sm flex items-center justify-center select-none">
                {initials}
              </div>
            </div>

            {/* Sign out — desktop */}
            <Button variant="ghost" size="sm" onClick={logout} className="hidden md:inline-flex">
              Sign out
            </Button>

            {/* Hamburger — shown on md and below (tablet/mobile) */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="lg:hidden p-2 rounded-[var(--radius-md)] text-[var(--color-steel)] hover:bg-black/5 hover:text-[var(--color-ink)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)]"
              aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={drawerOpen}
              aria-controls="trainer-mobile-drawer"
            >
              {drawerOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Desktop Left Sidebar ───────────────────────────────────────────── */}
      {/* Visible only on lg+ screens */}
      <aside
        className="hidden lg:flex flex-col fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-[var(--color-border)] z-30 shadow-[var(--shadow-sm)]"
        aria-label="Trainer navigation"
      >
        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link, location.pathname);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-[var(--color-ink)] text-white shadow-sm"
                    : "text-[var(--color-steel)] hover:text-[var(--color-ink)] hover:bg-black/5"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-[var(--color-steel)] group-hover:text-[var(--color-ink)]"
                  }`}
                />
                <span>{link.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-signal)] flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-bold text-[var(--color-steel)] hover:text-[var(--color-ink)] hover:bg-black/5 transition-all duration-200 group"
          >
            <LogOutIcon className="w-5 h-5 flex-shrink-0 group-hover:text-[var(--color-ink)]" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile / Tablet Drawer Backdrop ───────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-[var(--color-ink)]/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile / Tablet Slide-in Drawer ───────────────────────────────── */}
      <div
        id="trainer-mobile-drawer"
        className={`fixed top-16 right-0 w-72 bg-white border-l border-[var(--color-border)] z-50 lg:hidden flex flex-col transition-transform duration-300 ease-out shadow-[var(--shadow-2xl)] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          /* On mobile the bottom tab bar is fixed at bottom-0; keep drawer above it */
          bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Trainer navigation drawer"
      >
        {/* Drawer header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-border)] font-bold flex items-center justify-center select-none">
            {initials}
          </div>
          <div>
            <p className="font-bold text-[var(--color-ink)] text-sm leading-tight">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold text-[var(--color-steel)]">Trainer Account</p>
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

      {/* ── Main Layout Body ───────────────────────────────────────────────── */}
      {/*
        lg+:  ml-64 to clear sidebar, no bottom bar
        < lg: no ml, pb to clear bottom tab bar
      */}
      <div className="lg:ml-64 flex flex-col min-h-[calc(100vh-4rem)]">
        <main
          className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 page-enter"
          style={{ minWidth: 0 }} /* prevent flex child overflow */
        >
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ──────────────────────────────────────────── */}
      {/* Shown only on < md; trainer has 3 primary items */}
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

function RosterIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function ScheduleIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ExerciseIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" />
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

function LogOutIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function ReportsIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function BookingsIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function AvailabilityIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

