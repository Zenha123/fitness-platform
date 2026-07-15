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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fafbff 0%, #eef2ff 50%, #e0e7ff 100%)" }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-bloom" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-violet-500/10 blur-[80px] pointer-events-none animate-bloom" style={{ animationDelay: "200ms" }} />
      <div className="absolute top-[20%] right-[15%] w-[20rem] h-[20rem] rounded-full bg-sky-400/10 blur-[60px] pointer-events-none animate-bloom" style={{ animationDelay: "400ms" }} />
      
      {/* Centered Auth Card */}
      <div className="w-full max-w-[440px] relative z-10 animate-slide-up">
        <div className="glass-panel-elevated p-10 sm:p-12 shadow-2xl border-white/80">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <BoltIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
              FitCoach
            </h1>
            <p className="text-neutral-500 text-sm font-medium">
              Sign in to your account
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-6 animate-fade-in">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<MailIcon className="w-5 h-5" />}
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
              leftIcon={<LockIcon className="w-5 h-5" />}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
              className="mt-4 shadow-xl shadow-indigo-500/20 py-3.5 text-base"
            >
              Sign in
            </Button>
          </form>

          {/* Secure Platform Info */}
          <div className="mt-10 pt-8 border-t border-neutral-200/60 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
              <ShieldIcon className="w-4 h-4" />
              Secure Access
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed max-w-[260px] mx-auto">
              Accounts are provisioned by administrators or assigned coaches. No public registration available.
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs font-semibold text-neutral-400 mt-8">
          © {new Date().getFullYear()} FitCoach Platform
        </p>
      </div>
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

function ShieldIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
