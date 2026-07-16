import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import axiosClient from "../api/axiosClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !password || !confirmPassword) { 
      setError("Please fill out all fields."); 
      return; 
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/auth/register/", {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      navigate("/login", { state: { message: "Trainer account created successfully. Please sign in." } });
    } catch (err) {
      // Handle array or object error messages from DRF
      const errData = err.response?.data;
      if (errData && typeof errData === 'object') {
        const messages = [];
        for (const key in errData) {
          if (Array.isArray(errData[key])) {
            messages.push(`${key === 'non_field_errors' ? '' : key + ': '}${errData[key][0]}`);
          } else if (typeof errData[key] === 'string') {
            messages.push(errData[key]);
          }
        }
        if (messages.length > 0) {
          setError(messages.join(" "));
        } else {
          setError("Failed to register. Please check your inputs.");
        }
      } else {
        setError("Failed to register. Please try again later.");
      }
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
              Create a Trainer Account
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-6 animate-fade-in">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Input
              id="name"
              label="Full Name"
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon className="w-5 h-5" />}
              required
              autoFocus
            />

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
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<LockIcon className="w-5 h-5" />}
              required
              autoComplete="new-password"
            />

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<LockIcon className="w-5 h-5" />}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
              className="mt-4 shadow-xl shadow-indigo-500/20 py-3.5 text-base"
            >
              Sign Up
            </Button>
          </form>

          {/* Secure Platform Info */}
          <div className="mt-10 pt-8 border-t border-neutral-200/60 text-center">
            <p className="text-[13px] text-neutral-500 leading-relaxed max-w-[260px] mx-auto mb-4">
              Already have an account?
            </p>
            <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign In Instead &rarr;
            </Link>
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

function UserIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}
