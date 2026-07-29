import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TrainerLayout from "../components/layout/TrainerLayout";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { workoutsApi } from "../api/workouts";

export default function TrainerReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("analytics"); // 'analytics' | 'leaderboard'

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await workoutsApi.getReports();
      setData(res);
    } catch (err) {
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TrainerLayout>
        <PageContainer variant="dashboard" className="py-12 flex justify-center">
          <Spinner />
        </PageContainer>
      </TrainerLayout>
    );
  }

  const summary = data?.summary || {};
  const clientReports = data?.client_reports || [];
  const leaderboard = data?.leaderboard || [];

  return (
    <TrainerLayout>
      <PageContainer variant="dashboard" className="space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-ink)] p-6 sm:p-10 text-white shadow-lg animate-slide-up">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-md)] bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-orange-300 border border-white/10">
                📊 Coach Intelligence
              </span>
              <h1 className="text-2xl sm:text-4xl mt-3 text-white">
                Coach Reports & Roster Analytics
              </h1>
              <p className="text-white/70 mt-2 text-xs sm:text-base max-w-xl font-medium">
                Track client workout completion rates, session streaks, and monthly activity leaderboards for your roster.
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button
                variant={activeTab === "analytics" ? "accent" : "secondary"}
                size="md"
                onClick={() => setActiveTab("analytics")}
              >
                Roster Analytics
              </Button>
              <Button
                variant={activeTab === "leaderboard" ? "accent" : "secondary"}
                size="md"
                onClick={() => setActiveTab("leaderboard")}
              >
                Leaderboard 🏆
              </Button>
            </div>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Summary Metric Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 shadow-sm">
            <span className="block text-[10px] sm:text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">
              Overall Completion Rate
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
              {summary.overall_completion_rate}%
            </span>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-[var(--color-signal)] h-full rounded-full transition-all"
                style={{ width: `${summary.overall_completion_rate}%` }}
              />
            </div>
          </div>

          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 shadow-sm">
            <span className="block text-[10px] sm:text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">
              Monthly Completed Sessions
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {summary.total_monthly_sessions}
            </span>
            <span className="block text-xs text-[var(--color-steel)] mt-1 font-medium">
              This month across active roster
            </span>
          </div>

          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 shadow-sm">
            <span className="block text-[10px] sm:text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">
              Active Roster Ratio
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
              {summary.active_clients} / {summary.total_clients}
            </span>
            <span className="block text-xs text-[var(--color-steel)] mt-1 font-medium">
              Clients currently active
            </span>
          </div>

          <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 shadow-sm">
            <span className="block text-[10px] sm:text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest mb-1">
              Roster Leader #1
            </span>
            <span className="text-lg font-black text-[var(--color-ink)] truncate block">
              {leaderboard[0]?.client_name || "None yet"}
            </span>
            <span className="block text-xs text-emerald-600 font-bold mt-1">
              {leaderboard[0] ? `${leaderboard[0].monthly_completed} workouts this month` : "No sessions logged"}
            </span>
          </div>
        </div>

        {/* Tab Content 1: Roster Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h2 className="text-xl text-[var(--color-ink)]">Roster Engagement Breakdown</h2>
            </div>

            {clientReports.length === 0 ? (
              <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-10 text-center text-[var(--color-steel)] font-medium">
                No client data available yet. Add clients and schedule workouts to view analytics.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clientReports.map((item) => (
                  <div
                    key={item.client_id}
                    className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-sm hover-lift space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          to={`/trainer/clients/${item.client_id}`}
                          className="text-lg font-black text-[var(--color-ink)] hover:underline"
                        >
                          {item.client_name}
                        </Link>
                        <span className="block text-xs text-[var(--color-steel)] font-medium">
                          {item.client_email}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-[var(--radius-md)] text-[10px] font-black uppercase tracking-wider ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-[var(--color-steel)] border border-neutral-200"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[var(--color-ink)] mb-1">
                        <span>Workout Completion</span>
                        <span>{item.completion_rate}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[var(--color-ink)] h-full rounded-full transition-all"
                          style={{ width: `${item.completion_rate}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Footer Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border)] text-center">
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-wider">
                          Completed
                        </span>
                        <span className="text-sm font-black text-[var(--color-ink)]">
                          {item.total_completed} / {item.total_assigned}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-wider">
                          This Month
                        </span>
                        <span className="text-sm font-black text-emerald-600">
                          {item.monthly_completed}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-wider">
                          Last Workout
                        </span>
                        <span className="text-xs font-bold text-[var(--color-ink)] truncate block">
                          {item.last_workout_date || "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Roster Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <h2 className="text-xl text-[var(--color-ink)]">Roster Activity Leaderboard</h2>
                <p className="text-xs text-[var(--color-steel)] font-medium mt-0.5">
                  Ranked by completed workout sessions in the current month. Visible strictly to you as the coach.
                </p>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-10 text-center text-[var(--color-steel)] font-medium">
                No leaderboard entries available yet.
              </div>
            ) : (
              <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
                <div className="divide-y divide-[var(--color-border)]">
                  {leaderboard.map((item, index) => (
                    <div
                      key={item.client_id}
                      className="p-5 flex items-center justify-between hover:bg-black/5 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div
                          className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            index === 0
                              ? "bg-amber-400 text-amber-950 shadow-sm"
                              : index === 1
                              ? "bg-slate-300 text-slate-900"
                              : index === 2
                              ? "bg-amber-700 text-amber-100"
                              : "bg-black/5 text-[var(--color-steel)]"
                          }`}
                        >
                          #{index + 1}
                        </div>

                        <div>
                          <Link
                            to={`/trainer/clients/${item.client_id}`}
                            className="font-bold text-[var(--color-ink)] hover:underline block"
                          >
                            {item.client_name}
                          </Link>
                          <span className="text-xs text-[var(--color-steel)] font-medium">
                            {item.client_email}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-6">
                        <div>
                          <span className="block text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-wider">
                            Monthly Sessions
                          </span>
                          <span className="text-base font-black text-emerald-600">
                            {item.monthly_completed} completed
                          </span>
                        </div>
                        <div className="hidden sm:block">
                          <span className="block text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-wider">
                            Completion Rate
                          </span>
                          <span className="text-base font-black text-[var(--color-ink)]">
                            {item.completion_rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </TrainerLayout>
  );
}
