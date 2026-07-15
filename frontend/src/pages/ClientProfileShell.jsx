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
  const { user, logout } = useAuth();
  
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="card max-w-md w-full">
          <div className="card-body text-center py-10">
            <Alert variant="danger" className="mb-6">{error}</Alert>
            <Button variant="outline" onClick={() => navigate("/trainer/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const initials = client.name
    ? client.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Trainer uses their own unit preference for displaying weight data
  const unit = user?.weight_unit || "kg";

  return (
    <TrainerLayout>
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trainer/dashboard" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
          Roster
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-sm font-semibold text-neutral-900 truncate max-w-[150px]">
          {client.name}
        </span>
      </div>
        
        {/* Client Header Card */}
        <div className="card mb-6">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {initials}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                  {client.name}
                </h1>
                <span className={`badge ${client.is_active ? 'badge-success' : 'badge-neutral'}`}>
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
                {client.needs_password_change && (
                  <span className="badge badge-warning">Pending Setup</span>
                )}
              </div>
              <p className="text-neutral-500 flex items-center gap-2 mb-4">
                <MailIcon className="w-4 h-4" />
                {client.email}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                  <span className="text-neutral-400 block text-xs uppercase tracking-wider font-semibold mb-0.5">Joined</span>
                  <span className="text-neutral-900 font-medium">{new Date(client.created_at).toLocaleDateString()}</span>
                </div>
                <div className="bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                  <span className="text-neutral-400 block text-xs uppercase tracking-wider font-semibold mb-0.5">Last Workout</span>
                  <span className="text-neutral-900 font-medium">{client.last_completed_workout || "None yet"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-t border-neutral-200 px-6 sm:px-8 flex overflow-x-auto hide-scrollbar">
            {[
              { id: "overview", label: "Overview" },
              { id: "workouts", label: "Workouts" },
              { id: "progress", label: "Progress" },
              { id: "reviews", label: "Reviews" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? "border-violet-600 text-violet-600" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <OverviewTab client={client} onUpdate={handleUpdate} />
          )}
          {activeTab === "workouts" && (
            <WorkoutCalendar clientId={client.id} />
          )}
          {activeTab === "progress" && (
            <ProgressTab clientId={client.id} unit={unit} />
          )}
          {activeTab === "reviews" && (
            <ReviewsTab clientId={client.id} clientName={client.name} />
          )}
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
        <div className="card">
          <div className="card-header border-b border-neutral-100 p-5 flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-lg">Client Profile Details</h3>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
          
          <div className="card-body p-6">
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
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-neutral-300 text-violet-600 focus:ring-violet-600"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={loading}
                    />
                    <div>
                      <span className="block text-sm font-semibold text-neutral-900">Active Account</span>
                      <span className="block text-xs text-neutral-500">Uncheck to deactivate client. They will no longer be able to log in.</span>
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
                  <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Full Name</dt>
                  <dd className="text-neutral-900 font-medium">{client.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Email Address</dt>
                  <dd className="text-neutral-900 font-medium">{client.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Status</dt>
                  <dd className="text-neutral-900 font-medium">{client.is_active ? 'Active' : 'Deactivated'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Onboarding</dt>
                  <dd className="text-neutral-900 font-medium">{client.needs_password_change ? 'Pending Password Setup' : 'Completed'}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
      
      
      <div className="space-y-6">
        <div className="card bg-violet-50 border-violet-100">
          <div className="p-6">
            <h3 className="font-bold text-violet-900 mb-2">Trainer Tools</h3>
            <p className="text-sm text-violet-700 leading-relaxed">
              Use the tabs above to manage workouts, check progress logs, and post feedback review notes for {client.name}.
            </p>
          </div>
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
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-neutral-900">Weight Tracking</h3>
        <WeightChart entries={entries} unit={unit} />
      </div>

      {/* Photo Journey */}
      <div className="space-y-3 border-t border-neutral-200 pt-8">
        <h3 className="text-lg font-bold text-neutral-900">Photo Journey</h3>
        <PhotoTimeline entries={entries} unit={unit} />
      </div>

      {/* Strength Tracking */}
      <div className="space-y-3 border-t border-neutral-200 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-neutral-900">Strength Progression</h3>
          
          {exercises.length > 0 && (
            <select
              className="form-input text-xs font-semibold max-w-xs py-1.5"
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
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 p-6 text-center text-neutral-400 text-sm font-medium">
            Client has not logged any strength exercise records yet.
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

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div>
          <h3 className="font-bold text-neutral-900">Coaching Reviews</h3>
          <p className="text-xs text-neutral-400">
            Provide feedback reviews summarizing progress and improvement areas.
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
        <ReviewForm
          clientName={clientName}
          initialData={editingReview}
          onSubmit={handleSubmitReview}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 p-6 text-center text-neutral-400 text-sm font-medium">
            <span>No review notes posted yet.</span>
            <span className="text-xs text-neutral-400 mt-1">Click "Post Review Note" to share feedback with this client.</span>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isTrainer={true}
              onEdit={handleEditClick}
              onDelete={handleDeleteReview}
            />
          ))
        )}
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

function MailIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

