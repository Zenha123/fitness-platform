import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { workoutsApi } from "../api/workouts";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { Spinner, PageLoader } from "../components/ui/Spinner";
import TrainerLayout from "../components/layout/TrainerLayout";

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const content = () => {
    if (loading) return <PageLoader message="Loading workout log..." />;

    if (error) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Alert variant="danger">{error}</Alert>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      );
    }

    if (!log) return null;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="font-bold text-2xl text-neutral-900 truncate flex-1">
            {log.plan_title || "Ad-hoc Workout"}
          </h1>
          {log.completed ? (
             <span className="badge badge-success px-3 py-1">Completed</span>
          ) : (
             <span className="badge badge-warning px-3 py-1">Draft</span>
          )}
        </div>

        <div className="card p-6 border-b border-neutral-200 bg-white flex flex-wrap gap-6">
          <div>
            <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Date</span>
            <span className="text-neutral-900 font-medium">{log.date}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Logged At</span>
            <span className="text-neutral-900 font-medium">{new Date(log.logged_at).toLocaleString()}</span>
          </div>
          {!isTrainer && (
             <div className="ml-auto">
               <Link to={`/client/log-workout?logId=${log.id}`}>
                 <Button variant="outline" size="sm">Edit Log</Button>
               </Link>
             </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-4">Exercises Performed</h2>
          {log.entries && log.entries.length === 0 ? (
            <div className="text-neutral-500 italic">No exercises logged.</div>
          ) : (
            log.entries.map((entry, idx) => (
              <div key={idx} className="card p-5 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-neutral-900">{entry.exercise_name}</h3>
                  <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">{entry.exercise_category}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-lg">
                  <div>
                    <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Actual Sets</span>
                    <span className="text-neutral-900 font-bold text-lg">{entry.actual_sets}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Actual Reps</span>
                    <span className="text-neutral-900 font-bold text-lg">{entry.actual_reps || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Weight (kg)</span>
                    <span className="text-neutral-900 font-bold text-lg">{entry.actual_weight_kg || "-"}</span>
                  </div>
                </div>
                {entry.notes && (
                  <div className="mt-4 text-sm text-neutral-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <span className="font-semibold text-amber-800">Notes:</span> {entry.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {log.notes && (
          <div className="mt-8">
             <h2 className="text-lg font-bold text-neutral-900 mb-4">Session Notes</h2>
             <div className="card p-5 text-neutral-700 whitespace-pre-wrap leading-relaxed">
               {log.notes}
             </div>
          </div>
        )}
      </div>
    );
  };

  if (isTrainer) {
    return (
      <TrainerLayout>
        {content()}
      </TrainerLayout>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 page-enter">
       <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-lg text-neutral-900 tracking-tight">FitCoach</span>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" onClick={() => navigate("/client/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </header>
      {content()}
    </div>
  );
}
