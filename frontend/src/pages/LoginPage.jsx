import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Hero Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[58%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 hero-gradient" />

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />

        {/* Brand logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">FitCoach</span>
        </div>

        {/* Central illustration + copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          {/* SVG Illustration */}
          <div className="mb-10">
            <HeroIllustration />
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
            Coach smarter.<br />
            <span className="text-orange-300">Track faster.</span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-md">
            The all-in-one platform for fitness coaches to manage clients,
            schedule workouts, and visualize real progress — all in one place.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {["Client Management", "Progress Tracking", "Workout Scheduling", "Strength Charts"].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-white/80 text-sm font-medium border border-white/10"
              >
                <CheckIcon className="w-3.5 h-3.5 text-orange-300" />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonial / social proof */}
        <div className="relative z-10">
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
            <p className="text-white/85 text-sm italic leading-relaxed mb-3">
              "FitCoach completely transformed how I run my coaching business. My clients love the progress tracking."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white text-sm font-bold">
                JR
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Jordan Rivera</p>
                <p className="text-white/50 text-xs">Certified Strength Coach · 40+ Clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-neutral-50">
        <div className="w-full max-w-md page-enter">
          {/* Mobile brand header */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center">
              <BoltIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-xl text-neutral-900 tracking-tight">FitCoach</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-2">
              Welcome back
            </h2>
            <p className="text-neutral-500 text-sm">
              Sign in to your coaching account to continue.
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<MailIcon className="w-4.5 h-4.5" />}
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<LockIcon className="w-4.5 h-4.5" />}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
              className="mt-2"
            >
              Sign in to FitCoach
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 divider text-neutral-400 text-xs font-medium">
            Secure platform access
          </div>

          <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 flex gap-3">
            <InfoIcon className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-violet-700 leading-relaxed">
              <span className="font-semibold">No public registration.</span> Trainer accounts are created by the platform administrator. Client accounts are created by their assigned trainer.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-neutral-400">
            © {new Date().getFullYear()} FitCoach Platform · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Inline SVG Illustration ── */
function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg">
      {/* Dashboard mockup card */}
      <rect x="40" y="20" width="400" height="240" rx="16" fill="white" fillOpacity="0.12" />
      <rect x="40" y="20" width="400" height="240" rx="16" stroke="white" strokeOpacity="0.2" />

      {/* Header bar */}
      <rect x="40" y="20" width="400" height="48" rx="16" fill="white" fillOpacity="0.08" />
      <circle cx="76" cy="44" r="12" fill="white" fillOpacity="0.3" />
      <rect x="96" y="38" width="80" height="6" rx="3" fill="white" fillOpacity="0.5" />
      <rect x="96" y="48" width="48" height="4" rx="2" fill="white" fillOpacity="0.3" />

      {/* Stat cards */}
      <rect x="60" y="84" width="90" height="56" rx="10" fill="white" fillOpacity="0.15" />
      <rect x="164" y="84" width="90" height="56" rx="10" fill="white" fillOpacity="0.15" />
      <rect x="268" y="84" width="90" height="56" rx="10" fill="white" fillOpacity="0.15" />
      <rect x="372" y="84" width="48" height="56" rx="10" fill="rgba(249,115,22,0.35)" />

      <rect x="72" y="96" width="40" height="4" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="72" y="106" width="60" height="8" rx="4" fill="white" fillOpacity="0.8" />
      <rect x="72" y="120" width="32" height="4" rx="2" fill="rgba(74,222,128,0.8)" />

      <rect x="176" y="96" width="40" height="4" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="176" y="106" width="52" height="8" rx="4" fill="white" fillOpacity="0.8" />
      <rect x="176" y="120" width="36" height="4" rx="2" fill="rgba(249,115,22,0.8)" />

      <rect x="280" y="96" width="44" height="4" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="280" y="106" width="56" height="8" rx="4" fill="white" fillOpacity="0.8" />
      <rect x="280" y="120" width="28" height="4" rx="2" fill="rgba(167,139,250,0.8)" />

      {/* Chart area */}
      <rect x="60" y="154" width="240" height="88" rx="10" fill="white" fillOpacity="0.1" />
      <polyline points="76,224 108,208 140,216 172,192 204,200 236,176 268,184" stroke="rgba(167,139,250,0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="76,232 108,224 140,228 172,216 204,220 236,204 268,208" stroke="rgba(249,115,22,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Client list rows */}
      <rect x="316" y="154" width="104" height="20" rx="6" fill="white" fillOpacity="0.12" />
      <circle cx="328" cy="164" r="6" fill="rgba(74,222,128,0.6)" />
      <rect x="340" y="161" width="52" height="4" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="398" y="161" width="14" height="4" rx="2" fill="rgba(74,222,128,0.7)" />

      <rect x="316" y="180" width="104" height="20" rx="6" fill="white" fillOpacity="0.08" />
      <circle cx="328" cy="190" r="6" fill="rgba(249,115,22,0.6)" />
      <rect x="340" y="187" width="44" height="4" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="398" y="187" width="14" height="4" rx="2" fill="rgba(249,115,22,0.7)" />

      <rect x="316" y="206" width="104" height="20" rx="6" fill="white" fillOpacity="0.08" />
      <circle cx="328" cy="216" r="6" fill="rgba(167,139,250,0.6)" />
      <rect x="340" y="213" width="56" height="4" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="398" y="213" width="14" height="4" rx="2" fill="rgba(167,139,250,0.7)" />

      {/* Floating badge */}
      <rect x="300" y="40" width="120" height="32" rx="16" fill="rgba(249,115,22,0.9)" />
      <rect x="316" y="52" width="56" height="6" rx="3" fill="white" fillOpacity="0.9" />
      <circle cx="400" cy="56" r="8" fill="white" fillOpacity="0.2" />
    </svg>
  );
}

/* ── Icon helpers ── */
function BoltIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
  );
}
function CheckIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}
function MailIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}
function LockIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
function InfoIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
  );
}
