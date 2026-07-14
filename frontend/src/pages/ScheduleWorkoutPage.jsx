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
  
  const [pickerOpen, setPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [planId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch clients for dropdown
      const clientsData = await clientsApi.getClients();
      setClients(clientsData);

      if (planId) {
        // Edit mode
        const plan = await workoutsApi.getPlan(planId);
        setClientId(plan.client);
        setScheduledDate(plan.scheduled_date);
        setTitle(plan.title);
        setNotes(plan.notes || "");
        setExercises(plan.exercises || []);
      } else if (!preselectedClientId && clientsData.length > 0) {
        // Auto-select first client if creating new
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
      // Local ID just for React keying before save
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
      
      // Navigate back to client profile workouts tab
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
    // Append or replace? Let's ask via confirm, or just replace if empty, append if not.
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
      <div className="flex flex-col md:flex-row gap-6 mb-8 max-w-6xl mx-auto">
        
        {/* Left Panel: Settings */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <div className="card">
            <div className="p-5 space-y-4">
              <h2 className="font-bold text-neutral-900 text-lg mb-2">Workout Settings</h2>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Client</label>
                <select
                  className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm bg-neutral-50"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  disabled={!!planId} // Prevent changing client on edit
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <Input
                type="date"
                label="Date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                required
              />

              <Input
                label="Workout Title"
                placeholder="e.g. Upper Body Power"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Session Notes (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none h-24"
                  placeholder="e.g. Focus on explosive concentric movements."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Builder */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold text-neutral-900">
              {planId ? "Edit Workout" : "Build Workout"}
            </h1>
            <div className="flex items-center gap-2">
              {planId && (
                <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={handleDeletePlan}>
                  Delete Plan
                </Button>
              )}
              <Button variant="outline" onClick={handleSaveTemplate} loading={savingTemplate} disabled={exercises.length === 0}>
                Save as Template
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                {planId ? "Save Changes" : "Save Workout"}
              </Button>
            </div>
          </div>

          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          <div className="space-y-3 mb-6">
            {exercises.map((ex, index) => (
              <div key={ex.id || ex._localId} className="card p-4 flex gap-4 group">
                <div className="pt-2 cursor-move text-neutral-300 hover:text-neutral-500 transition-colors">
                  <DragIcon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                        {ex.exercise_category || ex.exercise_detail?.category}
                      </span>
                      <h3 className="font-bold text-neutral-900 text-lg mt-1">
                        {ex.exercise_name || ex.exercise_detail?.name}
                      </h3>
                    </div>
                    <button 
                      onClick={() => removeExercise(index)}
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Sets</label>
                      <input 
                        type="number" min="1"
                        className="w-full h-9 px-3 border border-neutral-200 rounded-md text-sm text-center font-medium"
                        value={ex.sets}
                        onChange={e => updateExercise(index, 'sets', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Reps</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 10 or 8-12"
                        className="w-full h-9 px-3 border border-neutral-200 rounded-md text-sm text-center font-medium"
                        value={ex.reps}
                        onChange={e => updateExercise(index, 'reps', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Weight (kg)</label>
                      <input 
                        type="number" step="0.5" placeholder="BW"
                        className="w-full h-9 px-3 border border-neutral-200 rounded-md text-sm text-center font-medium"
                        value={ex.weight_kg || ""}
                        onChange={e => updateExercise(index, 'weight_kg', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">Rest (sec)</label>
                      <input 
                        type="number" step="5" placeholder="e.g. 90"
                        className="w-full h-9 px-3 border border-neutral-200 rounded-md text-sm text-center font-medium"
                        value={ex.rest_seconds || ""}
                        onChange={e => updateExercise(index, 'rest_seconds', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <input 
                      type="text"
                      placeholder="Add exercise notes or cues..."
                      className="w-full text-sm text-neutral-600 border-none bg-neutral-50 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-violet-500/30"
                      value={ex.notes || ""}
                      onChange={e => updateExercise(index, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {exercises.length === 0 && (
              <div className="card border-dashed border-2 border-neutral-200 bg-transparent flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center mb-3">
                  <PlusIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-1">No exercises added</h3>
                <p className="text-sm text-neutral-500 mb-4">Click below to add exercises from your library.</p>
                <Button variant="outline" onClick={() => setTemplatePickerOpen(true)}>
                  <FolderIcon className="w-4 h-4" />
                  Load Template
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 border-dashed" onClick={() => setPickerOpen(true)}>
              <PlusIcon className="w-4 h-4" />
              Add Exercise
            </Button>
            <Button variant="outline" className="flex-1 border-dashed" onClick={() => setTemplatePickerOpen(true)}>
              <FolderIcon className="w-4 h-4" />
              Load Template
            </Button>
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
      <circle cx="9" cy="5" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="19" r="1" />
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
