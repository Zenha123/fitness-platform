import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { workoutsApi } from "../api/workouts";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import ExercisePicker from "../components/workouts/ExercisePicker";
import ClientLayout from "../components/layout/ClientLayout";
import PageContainer from "../components/layout/PageContainer";

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
  const [durationSeconds, setDurationSeconds] = useState(0);
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
        setDurationSeconds(log.duration_seconds || 0);
        setCompleted(log.completed);
        setEntries(log.entries.map(e => {
          // Construct sets array from log data
          const sets = (e.sets && e.sets.length > 0)
            ? e.sets.map(s => ({
                id: s.id,
                set_index: s.set_index,
                prescribed_reps: s.prescribed_reps || "",
                prescribed_weight_kg: s.prescribed_weight_kg || "",
                actual_reps: s.actual_reps !== null && s.actual_reps !== undefined ? s.actual_reps : "",
                actual_weight_kg: s.actual_weight_kg !== null && s.actual_weight_kg !== undefined ? s.actual_weight_kg : "",
                completed: !!s.completed
              }))
            : Array.from({ length: e.actual_sets || 1 }, (_, i) => ({
                set_index: i + 1,
                prescribed_reps: e.actual_reps || "",
                prescribed_weight_kg: e.actual_weight_kg || "",
                actual_reps: e.actual_reps || "",
                actual_weight_kg: e.actual_weight_kg || "",
                completed: false
              }));

          return {
            ...e,
            id: e.id,
            exercise: e.exercise,
            exercise_name: e.exercise_name,
            exercise_demo_link: e.exercise_demo_link || "",
            notes: e.notes || "",
            sets
          };
        }));
      } else if (planId) {
        const plan = await workoutsApi.getPlan(planId);
        setPlanTitle(plan.title);
        setDate(plan.scheduled_date || new Date().toISOString().split('T')[0]);
        setEntries(plan.exercises.map(e => {
          const numSets = e.sets || 3;
          const sets = Array.from({ length: numSets }, (_, i) => ({
            set_index: i + 1,
            prescribed_reps: e.reps || "",
            prescribed_weight_kg: e.weight_kg || "",
            actual_reps: e.reps || "",
            actual_weight_kg: e.weight_kg || "",
            completed: false
          }));

          return {
            exercise: e.exercise,
            exercise_name: e.exercise_name,
            exercise_demo_link: e.exercise_demo_link || "",
            notes: e.notes || "",
            sets
          };
        }));
      } else {
        setPlanTitle("Ad-hoc Workout");
      }
    } catch (err) {
      setError("Failed to load workout details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetChange = (entryIdx, setIdx, field, value) => {
    setEntries(prev => {
      const newEntries = [...prev];
      const targetSets = [...newEntries[entryIdx].sets];
      targetSets[setIdx] = {
        ...targetSets[setIdx],
        [field]: value
      };
      newEntries[entryIdx] = {
        ...newEntries[entryIdx],
        sets: targetSets
      };
      return newEntries;
    });
  };

  const handleToggleSetComplete = (entryIdx, setIdx) => {
    setEntries(prev => {
      const newEntries = [...prev];
      const targetSets = [...newEntries[entryIdx].sets];
      targetSets[setIdx] = {
        ...targetSets[setIdx],
        completed: !targetSets[setIdx].completed
      };
      newEntries[entryIdx] = {
        ...newEntries[entryIdx],
        sets: targetSets
      };
      return newEntries;
    });
  };

  const handleAddSet = (entryIdx) => {
    setEntries(prev => {
      const newEntries = [...prev];
      const currentSets = newEntries[entryIdx].sets;
      const lastSet = currentSets[currentSets.length - 1] || {};
      const newSet = {
        set_index: currentSets.length + 1,
        prescribed_reps: lastSet.prescribed_reps || "",
        prescribed_weight_kg: lastSet.prescribed_weight_kg || "",
        actual_reps: lastSet.actual_reps || "",
        actual_weight_kg: lastSet.actual_weight_kg || "",
        completed: false
      };
      newEntries[entryIdx] = {
        ...newEntries[entryIdx],
        sets: [...currentSets, newSet]
      };
      return newEntries;
    });
  };

  const handleRemoveSet = (entryIdx, setIdx) => {
    setEntries(prev => {
      const newEntries = [...prev];
      const filteredSets = newEntries[entryIdx].sets
        .filter((_, i) => i !== setIdx)
        .map((s, idx) => ({ ...s, set_index: idx + 1 }));
      newEntries[entryIdx] = {
        ...newEntries[entryIdx],
        sets: filteredSets
      };
      return newEntries;
    });
  };

  const handleEntryNotesChange = (entryIdx, notesValue) => {
    setEntries(prev => {
      const newEntries = [...prev];
      newEntries[entryIdx] = {
        ...newEntries[entryIdx],
        notes: notesValue
      };
      return newEntries;
    });
  };

  const handleAddExercise = (exerciseDef) => {
    const defaultSets = Array.from({ length: 3 }, (_, i) => ({
      set_index: i + 1,
      prescribed_reps: "10",
      prescribed_weight_kg: "",
      actual_reps: "10",
      actual_weight_kg: "",
      completed: false
    }));

    const newEntry = {
      _localId: Math.random().toString(36).substr(2, 9),
      exercise: exerciseDef.id,
      exercise_name: exerciseDef.name,
      exercise_demo_link: exerciseDef.demo_link || "",
      notes: "",
      sets: defaultSets
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
        duration_seconds: durationSeconds,
        completed: markComplete,
        entries: entries.map((e, idx) => ({
          exercise: e.exercise,
          actual_sets: e.sets.length,
          notes: e.notes || "",
          order: idx,
          sets: e.sets.map((s, sIdx) => ({
            set_index: sIdx + 1,
            prescribed_reps: s.prescribed_reps ? String(s.prescribed_reps) : null,
            prescribed_weight_kg: s.prescribed_weight_kg !== "" && s.prescribed_weight_kg !== null ? parseFloat(s.prescribed_weight_kg) : null,
            actual_reps: s.actual_reps !== "" && s.actual_reps !== null ? parseInt(s.actual_reps) : null,
            actual_weight_kg: s.actual_weight_kg !== "" && s.actual_weight_kg !== null ? parseFloat(s.actual_weight_kg) : null,
            completed: s.completed
          }))
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
    <ClientLayout>
      <PageContainer variant="builder" className="space-y-5 pb-40 md:pb-24">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/client/dashboard")}
              className="p-2 -ml-1 rounded-[var(--radius-md)] hover:bg-black/5 text-[var(--color-steel)] transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base text-[var(--color-ink)] leading-tight font-bold">
                {logId ? "Edit Log" : "Log Workout"}
              </h1>
              <p className="text-xs text-[var(--color-steel)] leading-none mt-1">{date}</p>
            </div>
          </div>

          {/* Date picker for ad-hoc */}
          {isAdHoc && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[var(--color-steel)] uppercase tracking-wide">Date</label>
              <input
                type="date"
                className="text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)] transition-all text-[var(--color-ink)] font-semibold"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl text-[var(--color-ink)] font-display uppercase tracking-wide">{planTitle}</h2>
            <p className="text-[var(--color-steel)] text-sm mt-0.5 font-medium">
              {isAdHoc ? "Add exercises and log your actual performance set-by-set." : "Punch in each set as you complete it during your session."}
            </p>
          </div>
          {completed && (
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckIcon className="w-3.5 h-3.5" />
              Completed
            </span>
          )}
        </div>

        {/* Exercise Cards with Set-by-Set Punch-Card Logging */}
        <div className="space-y-5">
          {entries.length === 0 ? (
            <div className="bg-[var(--color-paper)] border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)] flex flex-col items-center justify-center py-14 text-center px-6 shadow-sm">
              {isAdHoc ? (
                <>
                  <div className="w-14 h-14 rounded-[var(--radius-md)] bg-[var(--color-paper)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                    <DumbbellIcon className="w-7 h-7 text-[var(--color-ink)]" />
                  </div>
                  <p className="text-[var(--color-ink)] font-display uppercase tracking-wider">No exercises added</p>
                  <p className="text-sm text-[var(--color-steel)] mt-1 mb-5 font-medium">
                    Tap the button below to add exercises from your trainer's library.
                  </p>
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[var(--color-ink)] hover:bg-[var(--color-ink)]/90 rounded-[var(--radius-md)] shadow-sm transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Exercise
                  </button>
                </>
              ) : (
                <p className="text-[var(--color-steel)] font-medium">No exercises assigned for this workout.</p>
              )}
            </div>
          ) : (
            entries.map((entry, entryIdx) => (
              <div
                key={entry._localId || entry.id || entryIdx}
                className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm hover-lift"
              >
                {/* Left-border accent */}
                <div className="flex">
                  <div className="w-1 flex-shrink-0 bg-[var(--color-ink)]" />

                  <div className="flex-1 p-4 sm:p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink)] bg-black/5 border border-[var(--color-border)] px-2 py-0.5 rounded-[var(--radius-sm)]">
                          #{entryIdx + 1}
                        </span>
                        <h3 className="text-[var(--color-ink)] text-lg font-bold mt-1 leading-snug">{entry.exercise_name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.exercise_demo_link && (
                          <a
                            href={entry.exercise_demo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink)] bg-white border border-[var(--color-border)] hover:bg-black/5 px-2.5 py-1.5 rounded-[var(--radius-md)] shadow-sm transition-all"
                          >
                            <VideoIcon className="w-3.5 h-3.5" />
                            Demo
                          </a>
                        )}
                        {!completed && (
                          <button
                            onClick={() => handleRemoveEntry(entryIdx)}
                            className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-steel)] hover:text-[var(--color-signal)] hover:bg-[var(--color-signal)]/10 transition-all"
                            title="Remove Exercise"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Punch-Card Set Table / List */}
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--color-steel)] px-1">
                        <span className="col-span-2 sm:col-span-1 text-center">Set</span>
                        <span className="col-span-3 sm:col-span-3">Target</span>
                        <span className="col-span-3 sm:col-span-3">Reps</span>
                        <span className="col-span-3 sm:col-span-3">Weight (kg)</span>
                        <span className="col-span-1 text-center">Done</span>
                      </div>

                      {entry.sets.map((set, setIdx) => {
                        // Variance check against prescription
                        const repsDiffers = set.prescribed_reps && String(set.actual_reps) !== String(set.prescribed_reps);
                        const weightDiffers = set.prescribed_weight_kg !== "" && set.prescribed_weight_kg !== null && String(set.actual_weight_kg) !== String(set.prescribed_weight_kg);
                        const hasVariance = repsDiffers || weightDiffers;

                        return (
                          <div
                            key={setIdx}
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-[var(--radius-md)] border transition-all ${
                              set.completed
                                ? "bg-emerald-50/50 border-emerald-200"
                                : hasVariance
                                ? "bg-[var(--color-signal-dim)] border-[var(--color-signal)]/30"
                                : "bg-white border-[var(--color-border)]"
                            }`}
                          >
                            {/* Set Number */}
                            <div className="col-span-2 sm:col-span-1 flex items-center justify-center font-mono font-bold text-sm text-[var(--color-ink)]">
                              #{set.set_index}
                            </div>

                            {/* Target Prescription */}
                            <div className="col-span-3 sm:col-span-3 text-xs font-semibold text-[var(--color-steel)] truncate">
                              {set.prescribed_reps ? `${set.prescribed_reps} reps` : "—"}
                              {set.prescribed_weight_kg ? ` @ ${set.prescribed_weight_kg}kg` : ""}
                            </div>

                            {/* Actual Reps Input */}
                            <div className="col-span-3 sm:col-span-3">
                              <input
                                type="number"
                                min="0"
                                placeholder="Reps"
                                className="w-full text-center text-sm font-bold text-[var(--color-ink)] bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] py-1 px-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)]"
                                value={set.actual_reps}
                                onChange={(e) => handleSetChange(entryIdx, setIdx, "actual_reps", e.target.value)}
                              />
                            </div>

                            {/* Actual Weight Input */}
                            <div className="col-span-3 sm:col-span-3">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                placeholder="kg"
                                className="w-full text-center text-sm font-bold text-[var(--color-ink)] bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] py-1 px-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)]"
                                value={set.actual_weight_kg}
                                onChange={(e) => handleSetChange(entryIdx, setIdx, "actual_weight_kg", e.target.value)}
                              />
                            </div>

                            {/* Punch Card Checkbox & Delete */}
                            <div className="col-span-1 flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleSetComplete(entryIdx, setIdx)}
                                className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center border transition-all ${
                                  set.completed
                                    ? "bg-[var(--color-ink)] border-[var(--color-ink)] text-white shadow-sm"
                                    : "bg-white border-[var(--color-border)] hover:border-[var(--color-ink)] text-transparent"
                                }`}
                                title={set.completed ? "Mark incomplete" : "Punch set complete"}
                              >
                                <CheckIcon className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add / Remove Set Controls */}
                    {!completed && (
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddSet(entryIdx)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink)] hover:underline uppercase tracking-wider"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          Add Set
                        </button>
                        {entry.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(entryIdx, entry.sets.length - 1)}
                            className="text-xs font-bold text-rose-600 hover:underline uppercase tracking-wider"
                          >
                            Remove Last Set
                          </button>
                        )}
                      </div>
                    )}

                    {/* Exercise Notes input */}
                    <input
                      type="text"
                      placeholder="Add exercise notes (e.g. form cues, tempo)…"
                      className="w-full text-xs font-medium text-[var(--color-ink)] bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)] transition-all placeholder:text-[var(--color-steel)]/70"
                      value={entry.notes}
                      onChange={(e) => handleEntryNotesChange(entryIdx, e.target.value)}
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
              className="w-full py-3.5 border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)] text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-ink)] hover:bg-black/5 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <PlusIcon className="w-4 h-4" />
              Add Another Exercise
            </button>
          )}
        </div>

        {/* Session Notes */}
        <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 shadow-sm">
          <label className="block text-sm text-[var(--color-ink)] mb-2.5 flex items-center gap-2 font-display uppercase tracking-wider">
            <NotesIcon className="w-4 h-4 text-[var(--color-ink)]" />
            Session Notes
          </label>
          <textarea
            className="w-full min-h-[96px] resize-y text-sm text-[var(--color-ink)] bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)] transition-all font-medium"
            placeholder="How did the workout feel? Any general observations?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* ── Sticky Action Bar ── */}
        <div
          className="fixed left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[var(--color-border)] px-4 py-3 shadow-[var(--shadow-xl)] z-40 md:bottom-0"
          style={{
            bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            {!completed && (
              <button
                className="flex-1 h-12 px-4 flex items-center justify-center text-xs sm:text-sm font-bold uppercase tracking-wider border-2 border-[var(--color-border)] text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-black/5 hover:border-[var(--color-ink)] transition-all disabled:opacity-60"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                Save Draft
              </button>
            )}
            <button
              className="flex-1 h-12 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider border-2 border-transparent text-white bg-[var(--color-ink)] hover:bg-[var(--color-ink)]/90 rounded-[var(--radius-md)] shadow-sm transition-all disabled:opacity-60"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving && <SpinnerMini />}
              {completed ? "Update Log" : "Complete Workout"}
            </button>
          </div>
        </div>

        <ExercisePicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleAddExercise}
        />
      </PageContainer>
    </ClientLayout>
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
