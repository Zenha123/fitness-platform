import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export default function ClientLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "C";

  const navLinks = [
    { name: "Dashboard", path: "/client/dashboard", icon: DashboardIcon },
    { name: "Progress Log", path: "/client/progress", icon: ProgressIcon },
    { name: "Strength Analytics", path: "/client/strength", icon: StrengthIcon },
    { name: "Coach Reviews", path: "/client/reviews", icon: ReviewIcon },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-12" style={{ background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 50%, #e0e7ff 100%)" }}>
      {/* Background Ambient Blobs */}
      <div className="absolute top-[-150px] left-[-100px] ambient-blob-1"></div>
      <div className="absolute top-[20vh] right-[-200px] ambient-blob-2"></div>
      <div className="absolute bottom-[10vh] left-[5%] ambient-blob-coral"></div>

      {/* Top Header */}
      <header className="bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/client/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-neutral-900">
                Fit<span className="text-primary">Coach</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Profile & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* User Profile Summary (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 text-right">
              <div>
                <p className="text-sm font-bold text-neutral-900">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                  Client
                </p>
              </div>
              <div className="avatar avatar-md bg-indigo-50 text-primary border border-indigo-100 font-extrabold shadow-inner">
                {initials}
              </div>
            </div>

            {/* Sign Out Button (Desktop) */}
            <Button variant="ghost" size="sm" onClick={logout} className="hidden md:inline-flex">
              Sign out
            </Button>

            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sliding Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div 
        className={`fixed top-16 bottom-0 right-0 w-72 bg-white/95 backdrop-blur-lg border-l border-neutral-200 z-40 p-6 md:hidden shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* User info in drawer */}
          <div className="flex items-center gap-3 pb-6 border-b border-neutral-100">
            <div className="avatar avatar-md bg-indigo-50 text-primary border border-indigo-100 font-extrabold">
              {initials}
            </div>
            <div>
              <p className="font-bold text-neutral-800 text-sm">{user?.name}</p>
              <p className="text-[10px] uppercase font-bold text-neutral-400">Client Account</p>
            </div>
          </div>

          {/* Drawer Navigation Link List */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <Button 
            variant="outline" 
            className="w-full justify-center" 
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 page-enter">
        {children}
      </main>
    </div>
  );
}

/* Icons components */
function BoltIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ProgressIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

function ReviewIcon({ className }) {
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
