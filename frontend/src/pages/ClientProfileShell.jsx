import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clientsApi } from "../api/clients";
import { progressApi } from "../api/progress";
import { Button } from "../components/ui/Button";
import { Spinner, PageLoader } from "../components/ui/Spinner";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import TrainerLayout from "../components/layout/TrainerLayout";
import WorkoutCalendar from "../components/workouts/WorkoutCalendar";
import WeightChart from "../components/progress/WeightChart";
import PhotoTimeline from "../components/progress/PhotoTimeline";
import StrengthChart from "../components/progress/StrengthChart";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewForm from "../components/reviews/ReviewForm";

export default function ClientProfileShell() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getClient(id);
      setClient(data);
    } catch (err) {
      setError("Failed to load client profile. They may have been removed or you don't have access.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updateData) => {
    try {
      const data = await clientsApi.updateClient(id, updateData);
      setClient(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  if (loading) return <PageLoader message="Loading client profile..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 50%, #e0e7ff 100%)" }}>
        <div className="absolute top-[-15%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="glass-panel-elevated max-w-md w-full p-8 text-center">
          <Alert variant="danger" className="mb-6">{error}</Alert>
          <Button variant="outline" onClick={() => navigate("/trainer/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const initials = client.name
    ? client.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Trainer uses their own unit preference for weight representation
  const unit = user?.weight_unit || "kg";

  return (
    <TrainerLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <Link to="/trainer/dashboard" className="hover:text-primary transition-colors">
            Roster Database
          </Link>
          <span>/</span>
          <span className="text-neutral-900 truncate max-w-[150px]">
            {client.name}
          </span>
        </div>
          
        {/* Client Profile Header card */}
        <div className="glass-panel-elevated overflow-hidden animate-slide-up relative">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-50/20 blur-3xl pointer-events-none" />

          <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-primary border border-indigo-100/60 flex items-center justify-center text-2xl font-black shadow-inner flex-shrink-0">
              {initials}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                  {client.name}
                </h1>
                <span className={`badge ${client.is_active ? 'badge-success' : 'badge-neutral'} rounded-md font-extrabold text-[10px]`}>
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
                {client.needs_password_change && (
                  <span className="badge badge-warning rounded-md font-extrabold text-[10px]">🔑 Pending Setup</span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <MailIcon className="w-4 h-4 text-neutral-400" />
                  {client.email}
                </span>
                <span className="hidden sm:inline text-neutral-300">•</span>
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-neutral-400" />
                  Joined {new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Tabs header row */}
          <div className="border-t border-neutral-200/80 px-6 sm:px-8 flex overflow-x-auto hide-scrollbar bg-neutral-50/50">
            {[
              { id: "overview", label: "Overview", icon: OverviewIcon },
              { id: "workouts", label: "Workout Schedule", icon: CalendarIcon },
              { id: "progress", label: "Transformation logs", icon: ProgressIcon },
              { id: "reviews", label: "Coaching Notes", icon: ReviewIcon },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-5 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-2 -mb-px ${
                    isActive 
                      ? "border-primary text-primary" 
                      : "border-transparent text-neutral-400 hover:text-neutral-700 hover:border-neutral-200"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-neutral-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab body content panels */}
        <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
          {activeTab === "overview" && (
            <OverviewTab client={client} onUpdate={handleUpdate} />
          )}
          {activeTab === "workouts" && (
            <div className="glass-panel p-6">
              <WorkoutCalendar clientId={client.id} />
            </div>
          )}
          {activeTab === "progress" && (
            <ProgressTab clientId={client.id} unit={unit} />
          )}
          {activeTab === "reviews" && (
            <ReviewsTab clientId={client.id} clientName={client.name} />
          )}
        </div>

      </div>
    </TrainerLayout>
  );
}

function OverviewTab({ client, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(client.name);
  const [isActive, setIsActive] = useState(client.is_active);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      await onUpdate({ name, is_active: isActive });
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update client profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel">
          <div className="border-b border-neutral-100 p-5 flex items-center justify-between">
            <h3 className="font-extrabold text-neutral-900 text-base tracking-tight">Account Configuration</h3>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Modify Details
              </Button>
            )}
          </div>
          
          <div className="p-6">
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4">Profile updated successfully.</Alert>}

            {isEditing ? (
              <div className="space-y-4 max-w-md">
                <Input
                  id="edit-name"
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
                
                <div className="pt-2 pb-4 border-b border-neutral-100 mb-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-neutral-300 text-violet-600 focus:ring-violet-600 mt-0.5"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={loading}
                    />
                    <div>
                      <span className="block text-sm font-bold text-neutral-900">Active Account Status</span>
                      <span className="block text-xs text-neutral-400 font-semibold leading-relaxed mt-0.5">
                        Client will immediately lose platform access if deactivated.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" onClick={handleSave} loading={loading}>Save Changes</Button>
                  <Button variant="ghost" onClick={() => {
                    setIsEditing(false);
                    setName(client.name);
                    setIsActive(client.is_active);
                    setError("");
                  }} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Full Name</dt>
                  <dd className="text-neutral-900 font-extrabold">{client.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Email Address</dt>
                  <dd className="text-neutral-900 font-extrabold">{client.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Roster Status</dt>
                  <dd className="text-neutral-900 font-extrabold flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${client.is_active ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                    {client.is_active ? 'Active Profile' : 'Deactivated'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Onboarding Setup</dt>
                  <dd className="text-neutral-900 font-extrabold">
                    {client.needs_password_change ? 'Pending temporary reset' : 'Fully Registered'}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="glass-panel tint-violet border-indigo-100/50 p-6 shadow-sm hover-lift">
          <h3 className="font-extrabold text-primary mb-2">Coach Notes</h3>
          <p className="text-xs text-neutral-500 font-bold leading-relaxed">
            Use the layout tabs above to check calendar attendance records, browse progress check-ins, compare timeline logs, and post feedback review notes for {client.name}.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressTab({ clientId, unit }) {
  const [entries, setEntries] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [strengthData, setStrengthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgressData();
  }, [clientId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const [weightLogs, exerciseList] = await Promise.all([
        progressApi.getWeightEntries({ client: clientId }),
        progressApi.getStrengthExercises({ client: clientId })
      ]);
      setEntries(weightLogs);
      setExercises(exerciseList);
      if (exerciseList.length > 0) {
        setSelectedExerciseId(exerciseList[0].id);
      }
    } catch (err) {
      setError("Failed to load progress logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExerciseId) {
      fetchStrengthChart(selectedExerciseId);
    } else {
      setStrengthData(null);
    }
  }, [selectedExerciseId]);

  const fetchStrengthChart = async (exerciseId) => {
    try {
      setLoadingChart(true);
      const data = await progressApi.getStrengthData({ exercise: exerciseId, client: clientId });
      setStrengthData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChart(false);
    }
  };

  if (loading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-8">
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Weight Trend */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Bodyweight Progression</h3>
        <WeightChart entries={entries} unit={unit} />
      </div>

      {/* Photo Journey */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Timeline Photos</h3>
        <PhotoTimeline entries={entries} unit={unit} />
      </div>

      {/* Strength Analytics */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Strength Benchmarks</h3>
          
          {exercises.length > 0 && (
            <select
              className="form-input text-xs font-bold max-w-xs py-1.5 pr-8 rounded-xl"
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              disabled={loadingChart}
            >
              {exercises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.category})
                </option>
              ))}
            </select>
          )}
        </div>

        {exercises.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 p-6 text-center">
            <p className="text-sm text-neutral-400 font-bold">No exercise records logged yet.</p>
            <p className="text-xs text-neutral-400 font-medium mt-1">Strength progression charts will show once the client logs workouts.</p>
          </div>
        ) : loadingChart ? (
          <div className="h-64 flex items-center justify-center"><Spinner /></div>
        ) : (
          strengthData && (
            <StrengthChart
              data={strengthData.data}
              pr={strengthData.pr}
              unit={unit}
              exerciseName={strengthData.exercise_name}
            />
          )
        )}
      </div>
    </div>
  );
}

function ReviewsTab({ clientId, clientName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [clientId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await progressApi.getReviews({ client: clientId });
      setReviews(data);
    } catch (err) {
      setError("Failed to load review notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      if (editingReview) {
        await progressApi.updateReview(editingReview.id, reviewData);
      } else {
        await progressApi.createReview({
          client: clientId,
          ...reviewData
        });
      }
      setShowForm(false);
      setEditingReview(null);
      await fetchReviews();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await progressApi.deleteReview(reviewId);
      await fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  if (loading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="flex justify-between items-center glass-panel tint-violet p-5 border-indigo-100/50 shadow-sm">
        <div>
          <h3 className="font-extrabold text-neutral-900 tracking-tight">Coaching Log</h3>
          <p className="text-xs text-neutral-500 font-bold mt-0.5">
            Post summaries, check-in updates, and focal correction advice.
          </p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingReview(null);
              setShowForm(true);
            }}
          >
            Post Review Note
          </Button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel p-5 animate-slide-up">
          <ReviewForm
            clientName={clientName}
            initialData={editingReview}
            onSubmit={handleSubmitReview}
            onCancel={() => {
              setShowForm(false);
              setEditingReview(null);
            }}
          />
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 p-6 text-center">
            <span className="text-sm text-neutral-400 font-bold">No feedback logs yet.</span>
            <span className="text-xs text-neutral-400 mt-1 font-semibold">Post a review note to share logs with {clientName}.</span>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="glass-panel hover-lift overflow-hidden">
              <ReviewCard
                review={review}
                isTrainer={true}
                onEdit={handleEditClick}
                onDelete={handleDeleteReview}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* Nav Tab Icons */
function OverviewIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CalendarIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ProgressIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function ReviewIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
