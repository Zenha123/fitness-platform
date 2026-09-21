import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Public navbar aligned to Phase 1 §4 sitemap:
 * Home · About · Portfolio/Results · Services & Pricing ·
 * Book Coaching · Book Consultation (+ Login / Dashboard)
 */
const primaryNav = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About", end: true },
  { to: "/portfolio", label: "Results", end: true },
  { to: "/services", label: "Services & Pricing", end: true },
];

const bookingNav = [
  { to: "/book/one_on_one_coaching", label: "Book Coaching" },
  { to: "/book/consultation", label: "Book Consultation" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const dashboardPath = user
    ? user.role === "trainer"
      ? "/trainer/dashboard"
      : "/client/dashboard"
    : null;

  // Close mobile drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold whitespace-nowrap transition-colors no-underline ${
      isActive ? "text-white" : "text-white/70 hover:text-white"
    }`;

  const bookingLinkClass = ({ isActive }) =>
    `text-sm font-semibold whitespace-nowrap transition-colors no-underline ${
      isActive ? "text-[var(--color-signal)]" : "text-blue-300 hover:text-blue-200"
    }`;

  return (
    <nav className="sticky top-0 z-[100] border-b border-white/10 bg-[rgba(11,11,12,0.92)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="min-w-0 shrink font-[family-name:var(--font-display)] text-lg tracking-[0.06em] text-white no-underline sm:text-2xl sm:tracking-[0.08em]"
        >
          HAQQ <span className="text-[var(--color-signal)]">ATHLETE</span>
        </Link>

        {/* Desktop / large tablet — full sitemap */}
        <div className="hidden items-center gap-4 lg:flex xl:gap-5">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <span className="h-4 w-px bg-white/15" aria-hidden />
          {bookingNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={bookingLinkClass}>
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="text-sm font-semibold whitespace-nowrap text-white/70 no-underline hover:text-white"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-[var(--radius-md)] border border-white/20 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/5"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-signal)] px-3.5 py-2 text-sm font-bold text-white no-underline hover:opacity-90"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile / tablet toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/15 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="public-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="public-mobile-nav"
          className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-white/10 px-4 py-4 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold no-underline ${
                    isActive ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <p className="mt-3 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
              Book a session
            </p>
            {bookingNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold no-underline ${
                    isActive
                      ? "bg-[var(--color-signal)]/20 text-[var(--color-signal)]"
                      : "text-blue-300 hover:bg-white/5 hover:text-blue-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-3 border-t border-white/10 pt-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to={dashboardPath}
                    className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold text-white/80 no-underline hover:bg-white/5"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-[var(--radius-md)] border border-white/20 px-3 py-2.5 text-left text-sm font-semibold text-white"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-signal)] px-3.5 py-2.5 text-sm font-bold text-white no-underline"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
