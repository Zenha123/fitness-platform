import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TrainerLayout from "../components/layout/TrainerLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Spinner, PageLoader } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import ExercisePicker from "../components/workouts/ExercisePicker";
import TemplatePicker from "../components/workouts/TemplatePicker";
import { clientsApi } from "../api/clients";
import { workoutsApi } from "../api/workouts";

export default function ScheduleWorkoutPage() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get("client");
  const preselectedDate = searchParams.get("date");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [clients, setClients] = useState([]);

  // Plan State
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [scheduledDate, setScheduledDate] = useState(preselectedDate || new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [planId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const clientsData = await clientsApi.getClients();
      setClients(clientsData);

      if (planId) {
        const plan = await workoutsApi.getPlan(planId);
        setClientId(plan.client);
        setScheduledDate(plan.scheduled_date);
        setTitle(plan.title);
        setNotes(plan.notes || "");
        setExercises(plan.exercises || []);
        if (plan.is_completed) {
          setIsLocked(true);
          setLockReason("This workout has already been completed by the client and cannot be modified.");
        } else if (plan.is_past) {
          setIsLocked(true);
          setLockReason("This scheduled workout is in the past and cannot be modified.");
        }
      } else if (!preselectedClientId && clientsData.length > 0) {
        setClientId(clientsData[0].id);
      }
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exerciseDef) => {
    const newEx = {
      _localId: Math.random().toString(36).substr(2, 9),
      exercise: exerciseDef.id,
      exercise_detail: exerciseDef,
      sets: 3,
      reps: "10",
      weight_kg: "",
      rest_seconds: "",
      notes: ""
    };
    setExercises([...exercises, newEx]);
    setPickerOpen(false);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index) => {
    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!clientId) return setError("Please select a client.");
    if (!scheduledDate) return setError("Please select a date.");
    if (!title.trim()) return setError("Please enter a title.");
    if (exercises.length === 0) return setError("Please add at least one exercise.");

    setSaving(true);
    try {
      const payload = {
        client: clientId,
        scheduled_date: scheduledDate,
        title,
        notes,
        exercises: exercises.map((ex, i) => ({
          exercise: ex.exercise,
          sets: parseInt(ex.sets) || 1,
          reps: ex.reps.toString(),
          weight_kg: ex.weight_kg ? parseFloat(ex.weight_kg) : null,
          rest_seconds: ex.rest_seconds ? parseInt(ex.rest_seconds) : null,
          notes: ex.notes,
          order: i
        }))
      };

      if (planId) {
        await workoutsApi.updatePlan(planId, payload);
      } else {
        await workoutsApi.createPlan(payload);
      }

      navigate(`/trainer/clients/${clientId}?tab=workouts`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save workout plan.");
      setSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm("Are you sure you want to delete this scheduled workout?")) return;
    try {
      await workoutsApi.deletePlan(planId);
      navigate(`/trainer/clients/${clientId}?tab=workouts`);
    } catch (err) {
      setError("Failed to delete workout plan.");
    }
  };

  const handleSaveTemplate = async () => {
    const templateName = window.prompt("Enter a name for this template:");
    if (!templateName) return;

    setSavingTemplate(true);
    try {
      const payload = {
        title: templateName,
        exercises: exercises.map((ex, i) => ({
          exercise: ex.exercise,
          sets: parseInt(ex.sets) || 1,
          reps: ex.reps.toString(),
          weight_kg: ex.weight_kg ? parseFloat(ex.weight_kg) : null,
          rest_seconds: ex.rest_seconds ? parseInt(ex.rest_seconds) : null,
          notes: ex.notes,
          order: i
        }))
      };
      await workoutsApi.createTemplate(payload);
      alert("Template saved successfully!");
    } catch (err) {
      alert("Failed to save template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleLoadTemplate = (template) => {
    const newExercises = template.exercises.map(ex => ({
      _localId: Math.random().toString(36).substr(2, 9),
      exercise: ex.exercise,
      exercise_detail: { name: ex.exercise_name, category: ex.exercise_category },
      sets: ex.sets,
      reps: ex.reps,
      weight_kg: ex.weight_kg,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes
    }));

    if (exercises.length > 0) {
      if (window.confirm("Do you want to clear your current exercises and replace them with this template?")) {
        setExercises(newExercises);
        if (!title) setTitle(template.title);
      } else {
        setExercises([...exercises, ...newExercises]);
      }
    } else {
      setExercises(newExercises);
      if (!title) setTitle(template.title);
    }
    setTemplatePickerOpen(false);
  };

  if (loading) return <PageLoader message="Loading builder..." />;

  return (
    <TrainerLayout>
      {/* Lock Banner */}
      {isLocked && (
        <div className="mb-6 max-w-6xl mx-auto glass-panel tint-amber border-amber-200/50 flex items-start gap-3 p-4">
          <LockIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-amber-800">Workout Locked</p>
            <p className="text-xs text-amber-700 mt-0.5">{lockReason}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {planId ? (isLocked ? "View Workout" : "Edit Workout") : "Build Workout"}
            </h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              {isLocked ? "Read-only view of this workout plan." : "Design the perfect session for your client."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isLocked ? (
              <>
                <button
                  onClick={() => navigate(`/trainer/clients/${clientId}?tab=workouts`)}
                  className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate || exercises.length === 0}
                  className="px-4 py-2 text-sm font-bold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all disabled:opacity-50"
                >
                  Save as Template
                </button>
              </>
            ) : (
              <>
                {planId && (
                  <button
                    onClick={handleDeletePlan}
                    className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    Delete Plan
                  </button>
                )}
                <button
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate || exercises.length === 0}
                  className="px-4 py-2 text-sm font-bold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all disabled:opacity-50"
                >
                  {savingTemplate ? "Saving…" : "Save as Template"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-200 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 flex items-center gap-2"
                >
                  {saving && <SpinnerMini />}
                  {planId ? "Save Changes" : "Save Workout"}
                </button>
              </>
            )}
          </div>
        </div>

        {error && <Alert variant="danger" className="mb-5">{error}</Alert>}

        <div className="flex flex-col md:flex-row gap-6">
          {/* ── Left Panel: Settings ── */}
          <div className="w-full md:w-80 flex-shrink-0 space-y-4">
            <div className="glass-panel tint-sky border-sky-100/50 shadow-sm overflow-hidden">
              <div className="p-5 space-y-4">
                <h2 className="font-bold text-neutral-900">Workout Settings</h2>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Client</label>
                  <select
                    className="w-full h-10 px-3 border border-neutral-200 rounded-xl text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    disabled={!!planId || isLocked}
                  >
                    <option value="">Select a client…</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 border border-neutral-200 rounded-xl text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    disabled={isLocked}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Workout Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Upper Body Power"
                    className="w-full h-10 px-3 border border-neutral-200 rounded-xl text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isLocked}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Session Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-24 disabled:opacity-60"
                    placeholder="e.g. Focus on explosive concentric movements."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    disabled={isLocked}
                  />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            {exercises.length > 0 && (
              <div className="glass-panel tint-violet border-indigo-150/30 p-4 shadow-sm hover-lift">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Plan Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-xl p-3 text-center border border-indigo-150/30">
                    <p className="text-2xl font-extrabold text-indigo-700">{exercises.length}</p>
                    <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wide mt-0.5">Exercises</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 text-center border border-indigo-150/30">
                    <p className="text-2xl font-extrabold text-indigo-700">
                      {exercises.reduce((s, ex) => s + (parseInt(ex.sets) || 0), 0)}
                    </p>
                    <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wide mt-0.5">Total Sets</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Panel: Exercise Builder ── */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3 mb-4">
              {exercises.map((ex, index) => (
                <div
                  key={ex.id || ex._localId}
                  className="group glass-panel tint-violet border-indigo-150/30 p-5 flex gap-4 hover-lift shadow-sm"
                >
                  {!isLocked && (
                    <div className="pt-2 cursor-move text-neutral-300 hover:text-neutral-500 transition-colors flex-shrink-0">
                      <DragIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white/85 border border-indigo-100/50 px-2 py-0.5 rounded-md">
                          {ex.exercise_category || ex.exercise_detail?.category}
                        </span>
                        <h3 className="font-bold text-neutral-900 text-base mt-1">
                          {ex.exercise_name || ex.exercise_detail?.name}
                        </h3>
                      </div>
                      {!isLocked && (
                        <button
                          onClick={() => removeExercise(index)}
                          className="text-neutral-300 hover:text-rose-500 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 hover:bg-rose-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "Sets", field: "sets", type: "number", min: "1", placeholder: "" },
                        { label: "Reps", field: "reps", type: "text", placeholder: "e.g. 10" },
                        { label: "Weight (kg)", field: "weight_kg", type: "number", step: "0.5", placeholder: "BW" },
                        { label: "Rest (sec)", field: "rest_seconds", type: "number", step: "5", placeholder: "90" },
                      ].map(({ label, field, ...inputProps }) => (
                        <div key={field}>
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{label}</label>
                          <input
                            {...inputProps}
                            className="w-full h-9 px-3 border border-neutral-200 rounded-lg text-sm text-center font-semibold bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-neutral-100 disabled:text-neutral-400"
                            value={field === "weight_kg" ? (ex.weight_kg || "") : (field === "rest_seconds" ? (ex.rest_seconds || "") : ex[field])}
                            onChange={e => updateExercise(index, field, e.target.value)}
                            disabled={isLocked}
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder={isLocked ? "" : "Add exercise notes or coaching cues…"}
                      className="w-full text-xs text-neutral-600 border border-neutral-100 bg-neutral-50/60 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 disabled:bg-neutral-100/50 disabled:text-neutral-400"
                      value={ex.notes || ""}
                      onChange={e => updateExercise(index, 'notes', e.target.value)}
                      disabled={isLocked}
                    />
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {exercises.length === 0 && (
                <div className="border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-500 flex items-center justify-center mb-4">
                    <DumbbellIcon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-1">No exercises yet</h3>
                  <p className="text-sm text-neutral-500 mb-5">
                    Add exercises from your library or load a saved template.
                  </p>
                  {!isLocked && (
                    <button
                      onClick={() => setTemplatePickerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-neutral-200 bg-white rounded-xl hover:bg-neutral-50 transition-all shadow-sm"
                    >
                      <FolderIcon className="w-4 h-4 text-indigo-500" />
                      Load Template
                    </button>
                  )}
                </div>
              )}
            </div>

            {!isLocked && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-200 rounded-2xl text-sm font-bold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Exercise
                </button>
                <button
                  onClick={() => setTemplatePickerOpen(true)}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-200 rounded-2xl text-sm font-bold text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50/60 transition-all"
                >
                  <FolderIcon className="w-4 h-4" />
                  Load Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
      />
      <TemplatePicker
        isOpen={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={handleLoadTemplate}
      />
    </TrainerLayout>
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

function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function FolderIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function DragIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
