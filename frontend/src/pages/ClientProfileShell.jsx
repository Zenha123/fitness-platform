import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clientsApi } from "../api/clients";
import { Button } from "../components/ui/Button";
import { Spinner, PageLoader } from "../components/ui/Spinner";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import TrainerLayout from "../components/layout/TrainerLayout";
import WorkoutCalendar from "../components/workouts/WorkoutCalendar";

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
              { id: "progress", label: "Progress", disabled: true },
              { id: "reviews", label: "Reviews", disabled: true },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={`py-4 px-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? "border-violet-600 text-violet-600" 
                    : tab.disabled
                      ? "border-transparent text-neutral-300 cursor-not-allowed"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
                disabled={tab.disabled}
              >
                {tab.label}
                {tab.disabled && <span className="ml-2 text-[10px] bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Soon</span>}
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
            <h3 className="font-bold text-violet-900 mb-2">Module Previews</h3>
            <p className="text-sm text-violet-700 leading-relaxed mb-4">
              Detailed workouts, progress tracking, and reviews will appear in their respective tabs in upcoming modules.
            </p>
            <ul className="space-y-2 text-sm text-violet-800 font-medium">
              <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-violet-500" /> Module 4: Scheduling</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-violet-500" /> Module 5: Logging</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-violet-500" /> Module 6: Progress</li>
            </ul>
          </div>
        </div>
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
