import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { workoutsApi } from "../api/workouts";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import TrainerLayout from "../components/layout/TrainerLayout";
import ClientLayout from "../components/layout/ClientLayout";
import PageContainer from "../components/layout/PageContainer";

export default function ViewLogPage() {
  const { logId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isTrainer = user?.role === "trainer";

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLog();
  }, [logId]);

  const fetchLog = async () => {
    try {
      setLoading(true);
      const data = await workoutsApi.getLog(logId);
      setLog(data);
    } catch (err) {
      setError("Failed to load workout log.");
    } finally {
      setLoading(false);
    }
  };

  const LogContent = () => {
    if (loading) return <PageLoader message="Loading workout log…" />;

    if (error) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Alert variant="danger">{error}</Alert>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 text-sm font-semibold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
            ← Go Back
          </button>
        </div>
      );
    }

    if (!log) return null;

    const totalVolume = log.entries
      ? log.entries.reduce((sum, e) => sum + (e.actual_sets || 0) * (parseFloat(e.actual_weight_kg) || 0), 0)
      : 0;

    return (
      <PageContainer variant="form" className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 p-2 -ml-2 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--color-steel)] hover:text-[var(--color-ink)] hover:bg-black/5 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
        {/* ── Log Header ── */}
        <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-2xl text-[var(--color-ink)] leading-tight">
                  {log.plan_title || "Ad-hoc Workout"}
                </h1>
                {!isTrainer && (
                  <Link
                    to={`/client/log-workout?logId=${log.id}`}
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-ink)]/70 transition-colors uppercase tracking-wider"
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                    Edit this log
                  </Link>
                )}
              </div>
              <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                log.completed
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-amber-100 text-amber-700 border-amber-200"
              }`}>
                {log.completed ? (
                  <><CheckIcon className="w-3.5 h-3.5" />Completed</>
                ) : (
                  <><ClockIcon className="w-3.5 h-3.5" />Draft</>
                )}
              </span>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-[var(--radius-md)] p-3 border border-[var(--color-border)]">
                <p className="text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-0.5">Date</p>
                <p className="font-bold text-[var(--color-ink)] text-sm">{log.date}</p>
              </div>
              <div className="bg-white rounded-[var(--radius-md)] p-3 border border-[var(--color-border)]">
                <p className="text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-0.5">Logged At</p>
                <p className="font-bold text-[var(--color-ink)] text-sm">{new Date(log.logged_at).toLocaleString()}</p>
              </div>
              {totalVolume > 0 && (
                <div className="bg-black/5 rounded-[var(--radius-md)] p-3 border border-[var(--color-border)] col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-0.5">Total Volume</p>
                  <p className="font-extrabold text-[var(--color-ink)] text-sm">{totalVolume.toFixed(0)} kg</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Exercises ── */}
        <div>
          <h2 className="text-lg text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <DumbbellIcon className="w-5 h-5 text-[var(--color-ink)]" />
            Exercises Performed
            <span className="text-sm font-semibold text-[var(--color-steel)] ml-1">({log.entries?.length || 0})</span>
          </h2>

          {!log.entries || log.entries.length === 0 ? (
            <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 text-center text-[var(--color-steel)] italic font-medium">
              No exercises logged.
            </div>
          ) : (
            <div className="space-y-4">
              {log.entries.map((entry, idx) => (
                <div key={idx} className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm hover-lift">
                  <div className="flex">
                    <div className="w-1 flex-shrink-0 bg-[var(--color-ink)]" />
                    <div className="flex-1 p-5">
                      {/* Exercise header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-black/5 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-black text-[var(--color-ink)]">#{idx + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-[var(--color-ink)] text-base">{entry.exercise_name}</h3>
                            {entry.exercise_category && (
                              <span className="text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-wider">
                                {entry.exercise_category}
                              </span>
                            )}
                          </div>
                        </div>
                        {entry.exercise_demo_link && (
                          <a
                            href={entry.exercise_demo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[var(--color-ink)] px-2.5 py-1.5 rounded-[var(--radius-md)] shadow-sm hover:bg-[var(--color-ink)]/90 transition-all"
                          >
                            <VideoIcon className="w-3.5 h-3.5" />
                            Demo
                          </a>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-[var(--radius-md)] p-3 text-center border border-[var(--color-border)]">
                          <p className="text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Sets</p>
                          <p className="text-2xl font-extrabold text-[var(--color-ink)]">{entry.actual_sets}</p>
                        </div>
                        <div className="bg-white rounded-[var(--radius-md)] p-3 text-center border border-[var(--color-border)]">
                          <p className="text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Reps</p>
                          <p className="text-2xl font-extrabold text-[var(--color-ink)]">{entry.actual_reps || "—"}</p>
                        </div>
                        <div className="bg-white rounded-[var(--radius-md)] p-3 text-center border border-[var(--color-border)]">
                          <p className="text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">Weight</p>
                          <p className="text-2xl font-extrabold text-[var(--color-ink)]">
                            {entry.actual_weight_kg ? `${entry.actual_weight_kg}` : "BW"}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {entry.notes && (
                        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-md)] px-4 py-3 text-sm text-amber-800">
                          <span className="font-bold">Notes: </span>{entry.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {log.notes && (
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 shadow-sm">
            <h2 className="text-base text-[var(--color-ink)] mb-3 flex items-center gap-2">
              <NotesIcon className="w-4 h-4 text-[var(--color-ink)]" />
              Session Notes
            </h2>
            <p className="text-[var(--color-ink)] text-sm whitespace-pre-wrap leading-relaxed font-medium">
              {log.notes}
            </p>
          </div>
        )}
      </PageContainer>
    );
  };

  if (isTrainer) {
    return (
      <TrainerLayout>
        <LogContent />
      </TrainerLayout>
    );
  }

  return (
    <ClientLayout>
      <LogContent />
    </ClientLayout>
  );
}

function ArrowLeftIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function BoltIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
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

function ClockIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

function EditIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
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

function NotesIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
