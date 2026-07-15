import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { progressApi } from "../api/progress";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { Spinner, PageLoader } from "../components/ui/Spinner";
import WeightChart from "../components/progress/WeightChart";
import PhotoTimeline from "../components/progress/PhotoTimeline";

export default function WeightJourneyPage() {
  const { user, updatePreferences } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Log Form State
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);

  // Preference state
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
      // Re-fetch or locally convert entries (since display weight matches pref)
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
      if (photo) {
        formData.append("photo", photo);
      }

      await progressApi.createWeightEntry(formData);
      
      setSuccess("Progress entry added successfully!");
      setWeight("");
      setNotes("");
      setPhoto(null);
      setPhotoPreview(null);
      setShowLogForm(false);
      
      // Refresh list
      await fetchEntries();
    } catch (err) {
      console.error(err);
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

  // Determine if reminder is needed (14+ days since last entry)
  let showCadenceReminder = false;
  if (entries.length > 0) {
    const lastEntry = entries[entries.length - 1];
    const diffTime = Math.abs(new Date() - new Date(lastEntry.date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 14) {
      showCadenceReminder = true;
    }
  } else {
    showCadenceReminder = true; // No entries logged yet
  }

  if (loading) return <PageLoader message="Loading progress logs..." />;

  return (
    <div className="min-h-screen bg-neutral-50 page-enter pb-16">
      {/* Navigation Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/client/dashboard" className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              ← Dashboard
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-sm font-bold text-neutral-900">Weight & Photo Journey</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUnitToggle}
              className="text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg border border-neutral-200 transition-colors"
            >
              Unit: {unit.toUpperCase()}
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowLogForm(!showLogForm)}
            >
              {showLogForm ? "Close Form" : "Log Check-in"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Cadence Reminder */}
        {showCadenceReminder && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-sm">Time for a Check-in!</p>
              <p className="text-xs text-amber-700 mt-0.5">
                It's been more than 14 days since your last check-in. Consistent weight logs help your coach track trends accurately.
              </p>
            </div>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Log Form */}
        {showLogForm && (
          <form onSubmit={handleSubmit} className="card bg-white border border-neutral-200 p-6 space-y-4 shadow-md rounded-2xl">
            <h3 className="font-extrabold text-neutral-900 text-lg">Log Current Weight & Photo</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="log-weight"
                label={`Weight (${unit})`}
                type="number"
                step="0.1"
                placeholder="e.g. 78.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={formLoading}
                required
              />
              <Input
                id="log-date"
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={formLoading}
                required
              />
            </div>

            {/* Photo upload field */}
            <div className="space-y-1.5">
              <span className="form-label">Progress Photo (Optional)</span>
              <div className="flex flex-col sm:flex-row items-center gap-4 border-2 border-dashed border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
                {photoPreview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-200">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border border-neutral-200 bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs">
                    No Photo
                  </div>
                )}
                
                <div className="flex-1 text-center sm:text-left">
                  <label className="btn btn-outline btn-sm cursor-pointer inline-flex">
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                      disabled={formLoading}
                    />
                  </label>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    JPEG or PNG format. Served securely inside the platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="log-notes" className="form-label">Check-in Notes (Optional)</label>
              <textarea
                id="log-notes"
                className="form-input min-h-[80px]"
                placeholder="How do you feel? E.g., 'feeling lean', 'post-workout checkin'"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={formLoading}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLogForm(false);
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={formLoading}>
                Log Entry
              </Button>
            </div>
          </form>
        )}

        {/* Charts & Timeline */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">Weight Trend</h2>
            <WeightChart entries={entries} unit={unit} />
          </div>

          <div className="space-y-2 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-bold text-neutral-900">Photo Journey & Progression</h2>
            <PhotoTimeline entries={entries} unit={unit} />
          </div>
        </div>
        
        {/* Passive Watermark Banner */}
        <div className="text-center pt-8 opacity-45 select-none pointer-events-none">
          <div className="inline-flex items-center gap-1.5 bg-neutral-200/50 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest text-neutral-400 uppercase">
            <span>✨ FitCoach progress log</span>
            <span>•</span>
            <span>{user?.name}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
