import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { workoutsApi } from "../api/workouts";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { Spinner, PageLoader } from "../components/ui/Spinner";

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

  useEffect(() => {
    fetchData();
  }, [planId, logId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (logId) {
        // Edit mode
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
          actual_sets: e.actual_sets,
          actual_reps: e.actual_reps || "",
          actual_weight_kg: e.actual_weight_kg || "",
          notes: e.notes || ""
        })));
      } else if (planId) {
        // Create from plan
        const plan = await workoutsApi.getPlan(planId);
        setPlanTitle(plan.title);
        setDate(plan.scheduled_date || new Date().toISOString().split('T')[0]);
        setEntries(plan.exercises.map(e => ({
          exercise: e.exercise,
          exercise_name: e.exercise_name,
          actual_sets: e.sets,
          actual_reps: e.reps || "",
          actual_weight_kg: e.weight_kg || "",
          notes: e.notes || ""
        })));
      } else {
        // Ad-hoc mode (v1 simply empty, not fully featured yet)
        setPlanTitle("Ad-hoc Workout");
      }
    } catch (err) {
      setError("Failed to load workout details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
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
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader message="Loading workout..." />;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 page-enter">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/client/dashboard")} className="p-2 -ml-2 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="font-bold text-lg text-neutral-900 truncate">
              {logId ? "Edit Log" : "Log Workout"}
            </h1>
          </div>
          <div className="text-sm font-semibold text-neutral-500">
            {date}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900">{planTitle}</h2>
          <p className="text-neutral-500">Track your actual performance below.</p>
        </div>

        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="card p-8 text-center text-neutral-500">
              No exercises assigned for this workout.
            </div>
          ) : (
            entries.map((entry, idx) => (
              <div key={idx} className="card p-5 border-l-4 border-l-violet-500">
                <h3 className="font-bold text-neutral-900 mb-4">{entry.exercise_name}</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Sets</label>
                    <input
                      type="number"
                      min="1"
                      className="input w-full"
                      value={entry.actual_sets}
                      onChange={(e) => handleEntryChange(idx, "actual_sets", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Reps</label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="e.g. 10"
                      value={entry.actual_reps}
                      onChange={(e) => handleEntryChange(idx, "actual_reps", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="input w-full"
                      placeholder="Optional"
                      value={entry.actual_weight_kg}
                      onChange={(e) => handleEntryChange(idx, "actual_weight_kg", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    className="input w-full text-sm"
                    placeholder="Add notes for this exercise (optional)"
                    value={entry.notes}
                    onChange={(e) => handleEntryChange(idx, "notes", e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card p-5">
          <label className="block text-sm font-semibold text-neutral-900 mb-2">Session Notes</label>
          <textarea
            className="input w-full min-h-[100px] resize-y"
            placeholder="How did the workout feel? Any general notes?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-lg z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            {!completed && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleSave(false)}
                loading={saving}
              >
                Save Draft
              </Button>
            )}
            <Button 
              variant="primary" 
              className="flex-1"
              onClick={() => handleSave(true)}
              loading={saving}
            >
              {completed ? "Update Log" : "Complete Workout"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
