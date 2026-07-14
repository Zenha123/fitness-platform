import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { PageLoader, Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import AddClientModal from "../components/clients/AddClientModal";
import TrainerLayout from "../components/layout/TrainerLayout";
import { clientsApi } from "../api/clients";

export default function TrainerDashboard() {
  const { user, logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "T";

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getClients();
      setClients(data);
    } catch (err) {
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClientAdded = (newClient) => {
    setClients([newClient, ...clients]);
  };

  return (
    <TrainerLayout>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Client Roster
            </h1>
            <p className="text-neutral-500 mt-1 text-sm sm:text-base">
              Manage your clients and their fitness journey.
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : clients.length === 0 ? (
          <div className="card card-elevated">
            <div className="card-body-lg flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
                <UsersIcon className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                No clients yet
              </h3>
              <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-6">
                Get started by adding your first client to the platform. They'll receive a temporary password to log in.
              </p>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                Add your first client
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      <AddClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onClientAdded={handleClientAdded}
      />
    </TrainerLayout>
  );
}

function ClientCard({ client }) {
  const clientInitials = client.name
    ? client.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <Link to={`/trainer/clients/${client.id}`} className="block group">
      <div className="card h-full hover:border-violet-300 transition-colors duration-200">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="avatar avatar-md bg-neutral-100 text-neutral-600 group-hover:bg-violet-100 group-hover:text-violet-700 transition-colors">
                {clientInitials}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 truncate max-w-[150px]" title={client.name}>
                  {client.name}
                </h3>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${client.is_active ? 'text-emerald-600' : 'text-neutral-400'}`}>
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            {client.needs_password_change && (
              <span className="badge badge-warning text-[10px] py-1">Pending Setup</span>
            )}
          </div>

          <div className="space-y-3 mt-5 border-t border-neutral-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
                Last Workout
              </span>
              <span className="font-medium text-neutral-700">
                {client.last_completed_workout || "None yet"}
              </span>
            </div>
            
            {client.missed_sessions_flag && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-500 flex items-center gap-1.5 font-medium">
                  <AlertCircleIcon className="w-3.5 h-3.5" />
                  Status
                </span>
                <span className="font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  Missed 2+ sessions
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function CalendarIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function AlertCircleIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
