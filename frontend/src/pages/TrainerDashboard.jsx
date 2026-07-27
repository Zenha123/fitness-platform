import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import AddClientModal from "../components/clients/AddClientModal";
import TrainerLayout from "../components/layout/TrainerLayout";
import PageContainer from "../components/layout/PageContainer";
import { clientsApi } from "../api/clients";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Roster summaries derived from client list
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.is_active).length;
  const pendingClients = clients.filter(c => c.needs_password_change).length;
  const flaggedClients = clients.filter(c => c.missed_sessions_flag).length;

  return (
    <TrainerLayout>
      <PageContainer variant="dashboard" className="space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-ink)] p-8 sm:p-10 text-white shadow-lg animate-slide-up">
          {/* Subtle overlay decorative lines */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-md)] bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-orange-300 border border-white/10">
                ✨ Coach Workspace
              </span>
              <h1 className="text-3xl sm:text-4xl mt-3 text-white">
                Welcome back, {user?.name.split(" ")[0]}!
              </h1>
              <p className="text-white/70 mt-2 text-sm sm:text-base max-w-xl font-medium">
                Keep your clients motivated, analyze their strength progression metrics, and design training plans to unlock their best.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                variant="accent" 
                size="lg" 
                onClick={() => setIsModalOpen(true)}
                className="shadow-lg hover:scale-105"
              >
                <PlusIcon className="w-5 h-5 text-white" />
                Add New Client
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Summary Widgets Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {/* Card 1 */}
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm hover-lift p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-[var(--radius-md)] bg-black/5 text-[var(--color-ink)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <UsersIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Total Clients</span>
              <span className="text-3xl font-black text-[var(--color-ink)] leading-none">{loading ? "..." : totalClients}</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm hover-lift p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-[var(--radius-md)] bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <ActiveIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Active Roster</span>
              <span className="text-3xl font-black text-[var(--color-ink)] leading-none">{loading ? "..." : activeClients}</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm hover-lift p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-[var(--radius-md)] bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <SetupIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Pending Setup</span>
              <span className="text-3xl font-black text-[var(--color-ink)] leading-none">{loading ? "..." : pendingClients}</span>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm hover-lift p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-[var(--radius-md)] bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0">
              <AlertCircleIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Missed Alerts</span>
              <span className="text-3xl font-black text-rose-600 leading-none">{loading ? "..." : flaggedClients}</span>
            </div>
          </div>
        </div>

        {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

        {/* Client Grid Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h2 className="text-xl text-[var(--color-ink)] flex items-center gap-2">
            <span>Roster Database</span>
            <span className="text-xs bg-black/5 border border-[var(--color-border)] text-[var(--color-ink)] font-bold px-2 py-0.5 rounded-[var(--radius-md)]">
              {clients.length}
            </span>
          </h2>
        </div>

        {/* Client Cards List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] h-48 skeleton p-5" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] shadow-sm rounded-[var(--radius-xl)] p-10 flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-[var(--radius-md)] bg-black/5 border border-[var(--color-border)] text-[var(--color-ink)] flex items-center justify-center mb-5">
              <UsersIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg text-[var(--color-ink)] mb-2">No active clients</h3>
            <p className="text-sm text-[var(--color-steel)] max-w-sm leading-relaxed mb-6">
              Get started by adding your first client to your list. They will receive credentials immediately.
            </p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Register Client
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </PageContainer>

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

  const isFlagged = client.missed_sessions_flag;
  const isPending = client.needs_password_change;
  
  let panelClass = "glass-panel tint-violet border-indigo-150/30";
  if (isFlagged) {
    panelClass = "glass-panel tint-rose border-rose-200/30";
  } else if (isPending) {
    panelClass = "glass-panel tint-amber border-amber-200/30";
  } else if (!client.is_active) {
    panelClass = "glass-panel tint-sky border-sky-200/30";
  }

  return (
    <Link to={`/trainer/clients/${client.id}`} className="block group">
      <div className={`bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] hover-lift h-full overflow-hidden relative shadow-sm`}>
        {/* Accent indicator line */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          client.is_active ? (isFlagged ? "bg-rose-500" : "bg-[var(--color-ink)]") : "bg-neutral-300"
        }`} />

        <div className="p-5 pl-7">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-black/5 text-[var(--color-ink)] border border-[var(--color-border)] flex items-center justify-center font-extrabold group-hover:bg-[var(--color-ink)] group-hover:text-white transition-all duration-300">
                {clientInitials}
              </div>
              <div className="min-w-0">
                <h3 className="text-[var(--color-ink)] text-xl transition-colors truncate max-w-[140px]" title={client.name}>
                  {client.name}
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase mt-1 ${
                  client.is_active ? (isFlagged ? "text-rose-600" : "text-emerald-600") : "text-[var(--color-steel)]"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${client.is_active ? "bg-emerald-500 animate-pulse" : "bg-[var(--color-steel)]"}`} />
                  {client.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            
            {client.needs_password_change && (
              <span className="badge badge-warning text-[9px] py-1 px-2.5 rounded-lg font-extrabold">
                🔑 Pending Setup
              </span>
            )}
          </div>

          <div className="space-y-3 mt-6 border-t border-[var(--color-border)] pt-4">
            {/* Last workout date row */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-steel)] flex items-center gap-1.5 font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-steel)]" />
                Last Session Completed
              </span>
              <span className="font-bold text-[var(--color-ink)] bg-black/5 px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                {client.last_completed_workout || "None yet"}
              </span>
            </div>
            
            {/* Missed Sessions flag banner */}
            {client.missed_sessions_flag && (
              <div className="flex items-center justify-between text-xs bg-rose-50/50 border border-rose-100/50 p-2.5 rounded-xl">
                <span className="text-rose-500 flex items-center gap-1.5 font-bold">
                  <AlertCircleIcon className="w-4 h-4" />
                  Alert Flag
                </span>
                <span className="font-extrabold text-rose-600 text-[10px] tracking-wider uppercase">
                  Missed 2+ Sessions
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Icons */
function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function ActiveIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SetupIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2 4a2 2 0 012 2m-2-4h.01M18.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7z" />
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

function AlertCircleIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
