import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { progressApi } from "../api/progress";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import WeightChart from "../components/progress/WeightChart";
import PhotoTimeline from "../components/progress/PhotoTimeline";

export default function WeightJourneyPage() {
  const { user, updatePreferences } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);

  const unit = user?.weight_unit || "kg";

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await progressApi.getWeightEntries();
      setEntries(data);
    } catch (err) {
      setError("Failed to load progress logs.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUnitToggle = async () => {
    const newUnit = unit === "kg" ? "lb" : "kg";
    try {
      await updatePreferences({ weight_unit: newUnit });
      await fetchEntries();
    } catch (err) {
      setError("Failed to update unit preference.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) {
      setError("Please enter a valid weight.");
      return;
    }

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("weight_kg", weight);
      formData.append("date", date);
      formData.append("notes", notes);
      formData.append("input_unit", unit);
      if (photo) formData.append("photo", photo);

      await progressApi.createWeightEntry(formData);

      setSuccess("Progress entry logged successfully!");
      setWeight("");
      setNotes("");
      setPhoto(null);
      setPhotoPreview(null);
      setShowLogForm(false);

      await fetchEntries();
    } catch (err) {
      setError("Failed to log entry. Make sure data is valid.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this weight entry?")) {
      try {
        await progressApi.deleteWeightEntry(id);
        setSuccess("Weight entry deleted.");
        await fetchEntries();
      } catch (err) {
        setError("Failed to delete entry.");
      }
    }
  };

  // Cadence reminder logic (14+ days)
  let showCadenceReminder = false;
  if (entries.length > 0) {
    const lastEntry = entries[entries.length - 1];
    const diffDays = Math.ceil(Math.abs(new Date() - new Date(lastEntry.date)) / (1000 * 60 * 60 * 24));
    if (diffDays > 14) showCadenceReminder = true;
  } else {
    showCadenceReminder = true;
  }

  // Derive stat deltas
  const firstWeight = entries.length > 0 ? parseFloat(entries[0].weight_kg) : null;
  const lastWeight = entries.length > 0 ? parseFloat(entries[entries.length - 1].weight_kg) : null;
  const weightDelta = firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : null;

  if (loading) return <PageLoader message="Loading progress logs…" />;

  return (
    <div className="min-h-screen pb-20 relative overflow-x-hidden" style={{ background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 50%, #e0e7ff 100%)" }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-bloom" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-violet-500/10 blur-[80px] pointer-events-none animate-bloom" style={{ animationDelay: "200ms" }} />

      {/* ── Header ── */}
      <header className="bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/client/dashboard"
              className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-extrabold text-base text-neutral-900">Weight & Photo Journey</h1>
              <p className="text-xs text-neutral-400">Track your body composition over time</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUnitToggle}
              className="text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-xl border border-neutral-200 transition-colors"
            >
              {unit.toUpperCase()}
            </button>
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                showLogForm
                  ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 hover:-translate-y-0.5"
              }`}
            >
              {showLogForm ? "Close" : "Log Check-in"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Stats Row ── */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="glass-panel tint-sky border-sky-100/50 p-4 shadow-sm text-center hover-lift">
              <p className="text-2xl font-extrabold text-neutral-900">{entries.length}</p>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-1">Check-ins</p>
            </div>
            <div className="glass-panel tint-violet border-indigo-100/50 p-4 shadow-sm text-center hover-lift">
              <p className="text-2xl font-extrabold text-neutral-900">
                {lastWeight}{unit}
              </p>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-1">Current Weight</p>
            </div>
            {weightDelta !== null && (
              <div className={`glass-panel p-4 shadow-sm text-center col-span-2 sm:col-span-1 hover-lift ${
                parseFloat(weightDelta) < 0
                  ? "tint-emerald border-emerald-200/50"
                  : parseFloat(weightDelta) > 0
                  ? "tint-rose border-rose-200/50"
                  : "border-neutral-200/50"
              }`}>
                <p className={`text-2xl font-extrabold ${
                  parseFloat(weightDelta) < 0 ? "text-emerald-700"
                  : parseFloat(weightDelta) > 0 ? "text-rose-700"
                  : "text-neutral-700"
                }`}>
                  {parseFloat(weightDelta) > 0 ? "+" : ""}{weightDelta}{unit}
                </p>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-1">Total Change</p>
              </div>
            )}
          </div>
        )}

        {/* Cadence reminder */}
        {showCadenceReminder && (
          <div className="glass-panel tint-amber border-amber-200/50 flex items-start gap-3 p-4">
            <BellIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-amber-800">Time for a Check-in!</p>
              <p className="text-xs text-amber-700 mt-0.5">
                It's been more than 14 days since your last check-in. Consistent weight logs help your coach track trends accurately.
              </p>
            </div>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* ── Check-in Form ── */}
        {showLogForm && (
          <div className="glass-panel-elevated tint-violet border-indigo-150/30 overflow-hidden shadow-xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <h3 className="font-extrabold text-neutral-900 text-lg">Log Current Weight & Photo</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Weight ({unit}) *
                  </label>
                  <input
                    id="log-weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 78.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    disabled={formLoading}
                    required
                    className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Date *</label>
                  <input
                    id="log-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={formLoading}
                    required
                    className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Progress Photo (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 border-2 border-dashed border-neutral-200 rounded-xl p-4 bg-neutral-50/50 hover:border-indigo-300 transition-colors">
                  {photoPreview ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 shadow-sm flex-shrink-0">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border border-neutral-200 bg-neutral-100 flex items-center justify-center text-neutral-400 flex-shrink-0">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-neutral-200 bg-white text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all shadow-sm">
                      <UploadIcon className="w-4 h-4" />
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                        disabled={formLoading}
                      />
                    </label>
                    <p className="text-[10px] text-neutral-400 mt-1.5">
                      JPEG or PNG — stored securely on the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="log-notes" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Check-in Notes (Optional)
                </label>
                <textarea
                  id="log-notes"
                  className="w-full min-h-[80px] px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  placeholder="How do you feel? E.g., 'feeling lean', 'post-workout check-in'"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => { setShowLogForm(false); setPhoto(null); setPhotoPreview(null); }}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-200 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 flex items-center gap-2"
                >
                  {formLoading && <SpinnerMini />}
                  Log Entry
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Charts & Timeline ── */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <TrendIcon className="w-5 h-5 text-indigo-500" />
              Weight Trend
            </h2>
            <WeightChart entries={entries} unit={unit} />
          </div>

          <div className="space-y-2 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <CameraIcon className="w-5 h-5 text-indigo-500" />
              Photo Journey & Progression
            </h2>
            <PhotoTimeline entries={entries} unit={unit} />
          </div>
        </div>

        {/* Watermark */}
        <div className="text-center pt-4 opacity-40 select-none pointer-events-none">
          <div className="inline-flex items-center gap-1.5 bg-neutral-200/60 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest text-neutral-400 uppercase">
            <span>✨ FitCoach progress log</span>
            <span>•</span>
            <span>Coach {user?.trainer_name || "Your Coach"}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function SpinnerMini() {
  return (
    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function BellIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function TrendIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function CameraIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ImageIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function UploadIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}
