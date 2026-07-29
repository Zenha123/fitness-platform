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

  // Search, Filter & View state
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'active' | 'pending' | 'flagged'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

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

  // Filtered client list based on search & tab filters
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "active") return client.is_active;
    if (activeFilter === "pending") return client.needs_password_change;
    if (activeFilter === "flagged") return client.missed_sessions_flag;

    return true;
  });

  return (
    <TrainerLayout>
      <PageContainer variant="dashboard" className="space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-ink)] p-6 sm:p-10 text-white shadow-lg animate-slide-up">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-md)] bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-orange-300 border border-white/10">
                ✨ Coach Workspace
              </span>
              <h1 className="text-2xl sm:text-4xl mt-3 text-white">
                Welcome back, {user?.name ? user.name.split(" ")[0] : "Coach"}!
              </h1>
              <p className="text-white/70 mt-2 text-xs sm:text-base max-w-xl font-medium">
                Manage your client roster, analyze workout logs, schedule training sessions, and track strength progression.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                variant="accent" 
                size="lg" 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto shadow-lg hover:scale-105"
              >
                <PlusIcon className="w-5 h-5 text-white" />
                Add New Client
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Summary Widgets Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {/* Card 1 */}
          <button
            onClick={() => setActiveFilter("all")}
            className={`text-left bg-[var(--color-paper)] border rounded-[var(--radius-xl)] shadow-sm hover-lift p-4 sm:p-6 flex items-center gap-4 sm:gap-5 transition-all ${
              activeFilter === "all" ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]/10" : "border-[var(--color-border)]"
            }`}
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-[var(--radius-md)] bg-black/5 text-[var(--color-ink)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <UsersIcon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="block text-[10px] sm:text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Total Clients</span>
              <span className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] leading-none">{loading ? "..." : totalClients}</span>
            </div>
          </button>

          {/* Card 2 */}
          <button
            onClick={() => setActiveFilter("active")}
            className={`text-left bg-[var(--color-paper)] border rounded-[var(--radius-xl)] shadow-sm hover-lift p-4 sm:p-6 flex items-center gap-4 sm:gap-5 transition-all ${
              activeFilter === "active" ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-[var(--color-border)]"
            }`}
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-[var(--radius-md)] bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <ActiveIcon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="block text-[10px] sm:text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Active Roster</span>
              <span className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] leading-none">{loading ? "..." : activeClients}</span>
            </div>
          </button>

          {/* Card 3 */}
          <button
            onClick={() => setActiveFilter("pending")}
            className={`text-left bg-[var(--color-paper)] border rounded-[var(--radius-xl)] shadow-sm hover-lift p-4 sm:p-6 flex items-center gap-4 sm:gap-5 transition-all ${
              activeFilter === "pending" ? "border-amber-500 ring-2 ring-amber-500/10" : "border-[var(--color-border)]"
            }`}
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-[var(--radius-md)] bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <SetupIcon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="block text-[10px] sm:text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Pending Setup</span>
              <span className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] leading-none">{loading ? "..." : pendingClients}</span>
            </div>
          </button>

          {/* Card 4 */}
          <button
            onClick={() => setActiveFilter("flagged")}
            className={`text-left bg-[var(--color-paper)] border rounded-[var(--radius-xl)] shadow-sm hover-lift p-4 sm:p-6 flex items-center gap-4 sm:gap-5 transition-all ${
              activeFilter === "flagged" ? "border-rose-500 ring-2 ring-rose-500/10" : "border-[var(--color-border)]"
            }`}
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-[var(--radius-md)] bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0">
              <AlertCircleIcon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="block text-[10px] sm:text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Missed Alerts</span>
              <span className="text-2xl sm:text-3xl font-black text-rose-600 leading-none">{loading ? "..." : flaggedClients}</span>
            </div>
          </button>
        </div>

        {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

        {/* Search, Filter Toolbar & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl text-[var(--color-ink)] flex items-center gap-2">
              <span>Client Roster</span>
              <span className="text-xs bg-black/5 border border-[var(--color-border)] text-[var(--color-ink)] font-bold px-2 py-0.5 rounded-[var(--radius-md)]">
                {filteredClients.length}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search roster..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)]"
              />
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-steel)]" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-black/5 p-1 rounded-[var(--radius-md)] border border-[var(--color-border)]">
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "pending", label: "Pending" },
                { id: "flagged", label: "Alerts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-[var(--radius-sm)] transition-all ${
                    activeFilter === tab.id
                      ? "bg-white text-[var(--color-ink)] shadow-xs"
                      : "text-[var(--color-steel)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Switcher Toggle */}
            <div className="hidden sm:flex items-center bg-black/5 p-1 rounded-[var(--radius-md)] border border-[var(--color-border)]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded-[var(--radius-sm)] ${viewMode === "grid" ? "bg-white text-[var(--color-ink)] shadow-xs" : "text-[var(--color-steel)]"}`}
                aria-label="Grid View"
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1 rounded-[var(--radius-sm)] ${viewMode === "table" ? "bg-white text-[var(--color-ink)] shadow-xs" : "text-[var(--color-steel)]"}`}
                aria-label="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Client Roster Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] h-48 skeleton p-5" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] shadow-sm rounded-[var(--radius-xl)] p-10 flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-[var(--radius-md)] bg-black/5 border border-[var(--color-border)] text-[var(--color-ink)] flex items-center justify-center mb-5">
              <UsersIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg text-[var(--color-ink)] mb-2">No matching clients found</h3>
            <p className="text-sm text-[var(--color-steel)] max-w-sm leading-relaxed mb-6">
              {search || activeFilter !== "all"
                ? "Try adjusting your search query or filter tab."
                : "Get started by adding your first client to your list. They will receive login credentials."}
            </p>
            <Button variant="outline" onClick={() => { setSearch(""); setActiveFilter("all"); setIsModalOpen(true); }}>
              Add New Client
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-black/5 text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-wider">
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Completed Session</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-black/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-[var(--color-ink)]">
                      <Link to={`/trainer/clients/${client.id}`} className="hover:underline">
                        {client.name}
                      </Link>
                      <span className="block text-xs font-normal text-[var(--color-steel)]">{client.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      {client.missed_sessions_flag ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 rounded-md">
                          <AlertCircleIcon className="w-3 h-3" /> Missed Alerts
                        </span>
                      ) : client.needs_password_change ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
                          🔑 Pending Setup
                        </span>
                      ) : client.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-steel)] bg-neutral-100 border border-neutral-200 rounded-md">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--color-ink)] font-medium">
                      {client.last_completed_workout || "None yet"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/trainer/clients/${client.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-signal)]"
                      >
                        View Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

function SearchIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function GridIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function TableIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

