import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { workoutsApi } from "../api/workouts";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import ExercisePicker from "../components/workouts/ExercisePicker";

export default function LogWorkoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const logId = searchParams.get("logId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [planTitle, setPlanTitle] = useState("Ad-hoc Workout");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState(false);
  const [entries, setEntries] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [planId, logId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (logId) {
        const log = await workoutsApi.getLog(logId);
        setPlanTitle(log.plan_title || "Ad-hoc Workout");
        setDate(log.date);
        setNotes(log.notes || "");
        setCompleted(log.completed);
        setEntries(log.entries.map(e => ({
          ...e,
          id: e.id,
          exercise: e.exercise,
          exercise_name: e.exercise_name,
          exercise_demo_link: e.exercise_demo_link || "",
          actual_sets: e.actual_sets,
          actual_reps: e.actual_reps || "",
          actual_weight_kg: e.actual_weight_kg || "",
          notes: e.notes || ""
        })));
      } else if (planId) {
        const plan = await workoutsApi.getPlan(planId);
        setPlanTitle(plan.title);
        setDate(plan.scheduled_date || new Date().toISOString().split('T')[0]);
        setEntries(plan.exercises.map(e => ({
          exercise: e.exercise,
          exercise_name: e.exercise_name,
          exercise_demo_link: e.exercise_demo_link || "",
          actual_sets: e.sets,
          actual_reps: e.reps || "",
          actual_weight_kg: e.weight_kg || "",
          notes: e.notes || ""
        })));
      } else {
        setPlanTitle("Ad-hoc Workout");
      }
    } catch (err) {
      setError("Failed to load workout details.");
    } finally {
      setLoading(false);
    }
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleAddExercise = (exerciseDef) => {
    const newEntry = {
      _localId: Math.random().toString(36).substr(2, 9),
      exercise: exerciseDef.id,
      exercise_name: exerciseDef.name,
      exercise_demo_link: exerciseDef.demo_link || "",
      actual_sets: 3,
      actual_reps: "10",
      actual_weight_kg: "",
      notes: ""
    };
    setEntries(prev => [...prev, newEntry]);
    setPickerOpen(false);
  };

  const handleRemoveEntry = (index) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (markComplete) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        plan: planId || null,
        date,
        notes,
        completed: markComplete,
        entries: entries.map((e, idx) => ({
          exercise: e.exercise,
          actual_sets: parseInt(e.actual_sets) || 1,
          actual_reps: String(e.actual_reps),
          actual_weight_kg: e.actual_weight_kg ? parseFloat(e.actual_weight_kg) : null,
          notes: e.notes,
          order: idx
        }))
      };

      if (logId) {
        await workoutsApi.updateLog(logId, payload);
      } else {
        await workoutsApi.createLog(payload);
      }

      navigate("/client/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save workout log.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader message="Loading workout…" />;

  const isAdHoc = !planId && !logId;

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden" style={{ background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 50%, #e0e7ff 100%)" }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-bloom" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-violet-500/10 blur-[80px] pointer-events-none animate-bloom" style={{ animationDelay: "200ms" }} />
      
      {/* ── Sticky Header ── */}
      <header className="bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/client/dashboard")}
              className="p-2 -ml-1 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-base text-neutral-900 leading-tight">
                {logId ? "Edit Log" : "Log Workout"}
              </h1>
              <p className="text-xs text-neutral-400 leading-none">{date}</p>
            </div>
          </div>

          {/* Date picker for ad-hoc */}
          {isAdHoc && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Date</label>
              <input
                type="date"
                className="text-sm border border-neutral-200 rounded-xl px-3 py-1.5 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900">{planTitle}</h2>
            <p className="text-neutral-500 text-sm mt-0.5">
              {isAdHoc ? "Add exercises and log your actual performance." : "Track your actual sets, reps, and weights below."}
            </p>
          </div>
          {completed && (
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckIcon className="w-3.5 h-3.5" />
              Completed
            </span>
          )}
        </div>

        {/* Exercise Cards */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center py-14 text-center px-6">
              {isAdHoc ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                    <DumbbellIcon className="w-7 h-7 text-indigo-500" />
                  </div>
                  <p className="font-bold text-neutral-800">No exercises added</p>
                  <p className="text-sm text-neutral-400 mt-1 mb-5">
                    Tap the button below to add exercises from your trainer's library.
                  </p>
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Exercise
                  </button>
                </>
              ) : (
                <p className="text-neutral-500">No exercises assigned for this workout.</p>
              )}
            </div>
          ) : (
            entries.map((entry, idx) => (
              <div
                key={entry._localId || entry.id || idx}
                className="glass-panel tint-violet border-indigo-150/30 overflow-hidden shadow-md"
              >
                {/* Left-border accent */}
                <div className="flex">
                  <div className="w-1 flex-shrink-0 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-l-2xl" />

                  <div className="flex-1 p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          #{idx + 1}
                        </span>
                        <h3 className="font-extrabold text-neutral-900 text-lg mt-1">{entry.exercise_name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.exercise_demo_link && (
                          <a
                            href={entry.exercise_demo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all"
                          >
                            <VideoIcon className="w-3.5 h-3.5" />
                            Demo
                          </a>
                        )}
                        {!completed && (
                          <button
                            onClick={() => handleRemoveEntry(idx)}
                            className="p-1.5 rounded-xl text-neutral-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Sets", field: "actual_sets", type: "number", min: "1" },
                        { label: "Reps", field: "actual_reps", type: "text", placeholder: "e.g. 10" },
                        { label: "Weight (kg)", field: "actual_weight_kg", type: "number", step: "0.5", placeholder: "BW" },
                      ].map(({ label, field, ...inputProps }) => (
                        <div key={field} className="bg-white/60 rounded-xl p-3 border border-indigo-100/50">
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">{label}</label>
                          <input
                            {...inputProps}
                            className="w-full text-center text-lg font-extrabold text-neutral-900 bg-transparent border-none outline-none focus:outline-none"
                            value={entry[field]}
                            onChange={(e) => handleEntryChange(idx, field, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Notes input */}
                    <input
                      type="text"
                      placeholder="Add notes for this exercise…"
                      className="w-full text-sm text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      value={entry.notes}
                      onChange={(e) => handleEntryChange(idx, "notes", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Add another exercise (when entries exist) */}
          {!completed && entries.length > 0 && (
            <button
              onClick={() => setPickerOpen(true)}
              className="w-full py-3.5 border-2 border-dashed border-indigo-200 rounded-2xl text-sm font-bold text-indigo-500 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50/40 transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Another Exercise
            </button>
          )}
        </div>

        {/* Session Notes */}
        <div className="glass-panel tint-sky border-sky-100/50 p-5 shadow-md">
          <label className="block text-sm font-bold text-neutral-900 mb-2.5 flex items-center gap-2">
            <NotesIcon className="w-4 h-4 text-indigo-400" />
            Session Notes
          </label>
          <textarea
            className="w-full min-h-[96px] resize-y text-sm text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="How did the workout feel? Any general observations?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </main>

      {/* ── Sticky Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-neutral-200 px-4 py-4 shadow-2xl z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {!completed && (
            <button
              className="flex-1 py-3 text-sm font-bold border-2 border-neutral-200 text-neutral-600 rounded-2xl hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-60"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              Save Draft
            </button>
          )}
          <button
            className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-2xl shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving && <SpinnerMini />}
            {completed ? "Update Log" : "Complete Workout ✓"}
          </button>
        </div>
      </div>

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
      />
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

function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function VideoIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DumbbellIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v18M18 3v18M2 9h4v6H2zM18 9h4v6h-4zM6 12h12" />
    </svg>
  );
}

function NotesIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
