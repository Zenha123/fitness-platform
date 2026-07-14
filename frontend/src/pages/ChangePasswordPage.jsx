import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";

const REQUIREMENTS = [
  { id: "length",  label: "At least 8 characters",              test: (p) => p.length >= 8 },
  { id: "upper",   label: "One uppercase letter",               test: (p) => /[A-Z]/.test(p) },
  { id: "number",  label: "One number",                         test: (p) => /\d/.test(p) },
];

export default function ChangePasswordPage() {
  const { changePassword, user, logout } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword]   = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [confirm, setConfirm]           = useState("");
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);
  const [loading, setLoading]           = useState(false);

  const checks = REQUIREMENTS.map((r) => ({ ...r, passed: r.test(newPassword) }));
  const allPassed = checks.every((c) => c.passed);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!oldPassword || !newPassword || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (!allPassed) {
      setError("Your new password doesn't meet the requirements below.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        const path = user?.role === "trainer" ? "/trainer/dashboard" : "/client/dashboard";
        navigate(path, { replace: true });
      }, 1800);
    } catch (err) {
      const data = err.response?.data;
      if (data?.old_password) {
        setError("Current password is incorrect.");
      } else if (data?.new_password) {
        setError(Array.isArray(data.new_password) ? data.new_password[0] : data.new_password);
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-60 pointer-events-none" />

      <div className="w-full max-w-lg relative page-enter">
        {/* Brand header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center shadow-lg">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">FitCoach</span>
          </div>
        </div>

        {/* Card */}
        <div className="card card-elevated">
          <div className="card-body-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 mb-4">
                <ShieldIcon className="w-7 h-7 text-violet-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-neutral-900 mb-2">
                Secure your account
              </h1>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {user?.name ? `Hi ${user.name.split(" ")[0]}, ` : ""}
                You're required to set a new password before accessing the platform.
              </p>
            </div>

            {/* Alerts */}
            {error && !success && (
              <Alert variant="danger" className="mb-5">{error}</Alert>
            )}
            {success && (
              <Alert variant="success" className="mb-5">
                Password updated successfully! Redirecting you now…
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                id="old-password"
                label="Current / temporary password"
                type="password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={success}
                required
                autoComplete="current-password"
              />

              <Input
                id="new-password"
                label="New password"
                type="password"
                placeholder="Create a strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={success}
                required
                autoComplete="new-password"
              />

              {/* Password strength requirements */}
              {newPassword.length > 0 && (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  {checks.map((c) => (
                    <div key={c.id} className="flex items-center gap-2.5 text-xs font-medium">
                      <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                        c.passed ? "bg-emerald-500" : "bg-neutral-200"
                      }`}>
                        {c.passed && <CheckIconSm className="w-2.5 h-2.5 text-white" />}
                      </span>
                      <span className={c.passed ? "text-emerald-700" : "text-neutral-400"}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Input
                id="confirm-password"
                label="Confirm new password"
                type="password"
                placeholder="Re-enter your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={success}
                required
                autoComplete="new-password"
                error={
                  confirm.length > 0 && confirm !== newPassword
                    ? "Passwords don't match"
                    : undefined
                }
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                disabled={success}
                className="mt-2"
              >
                {success ? "Password saved!" : "Save new password"}
              </Button>
            </form>

            {/* Cancel */}
            <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
              <button
                type="button"
                onClick={logout}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-medium underline-offset-2 hover:underline"
              >
                Cancel and sign out
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} FitCoach Platform · All rights reserved
        </p>
      </div>
    </div>
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
function ShieldIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function CheckIconSm({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}
