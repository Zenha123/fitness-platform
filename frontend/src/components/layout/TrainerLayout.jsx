import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export default function TrainerLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "T";

  const navLinks = [
    { name: "Roster", path: "/trainer/dashboard" },
    { name: "Schedule Workout", path: "/trainer/schedule" },
    { name: "Exercise Library", path: "/trainer/exercises" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 page-enter">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/trainer/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center shadow-sm">
                <BoltIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-neutral-900 tracking-tight hidden sm:block">FitCoach</span>
            </Link>

            {/* Main Navigation */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || 
                                 (link.path === "/trainer/dashboard" && location.pathname.startsWith("/trainer/clients"));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right mr-1">
              <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-400">Trainer</p>
            </div>
            <div className="avatar avatar-md bg-violet-100 text-violet-700 font-bold border border-violet-200">{initials}</div>
            <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function BoltIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
  );
}
