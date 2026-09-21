import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import WorkoutCalendar from "../components/workouts/WorkoutCalendar";
import { workoutsApi } from "../api/workouts";
import { getClientBookings } from "../api/bookings";
import { Spinner } from "../components/ui/Spinner";
import ClientLayout from "../components/layout/ClientLayout";
import PageContainer from "../components/layout/PageContainer";

export default function ClientDashboard() {
  const { user } = useAuth();
  
  const [todayPlan, setTodayPlan] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayWorkout();
  }, []);

  const fetchTodayWorkout = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const monthStr = today.substring(0, 7);
      
      const [plansData, logsData, bookingsData] = await Promise.all([
        workoutsApi.getPlans({ month: monthStr }),
        workoutsApi.getLogs({ month: monthStr }),
        getClientBookings().catch(() => [])
      ]);
      
      const plan = plansData.find(p => p.scheduled_date === today);
      const log = logsData.find(l => l.date === today);
      
      if (plan) setTodayPlan(plan);
      if (log) setTodayLog(log);
      const bList = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.results || []);
      setMyBookings(bList);
    } catch (error) {
      console.error("Failed to fetch today's workout", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <PageContainer variant="dashboard" className="space-y-8">
        {/* Welcome Greeting Hero Section */}
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-ink)] p-8 sm:p-10 text-white shadow-lg animate-slide-up">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-md)] bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-[var(--color-signal)] border border-white/10">
                ⚡️ Member Dashboard
              </span>
              <h1 className="text-3xl sm:text-4xl mt-3 text-white">
                Hey, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-white/70 mt-2 text-sm sm:text-base max-w-xl font-medium">
                Welcome back to your personalized training space. Access your schedule, track metrics, log sets, and see your stats grow.
              </p>
            </div>
            <div>
              <Link to="/book">
                <Button variant="primary" className="shadow-lg whitespace-nowrap">
                  Book 1-on-1 Call 📅
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bookings & Appointments Widget */}
        {myBookings.length > 0 && (
          <div className="rounded-[var(--radius-xl)] bg-[var(--color-ink)] border border-white/10 p-6 text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>🗓️</span> Upcoming Coaching Calls & Consultations
              </h2>
              <Link to="/book" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                + Book Another Call
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      {b.service_details?.title || "Coaching Session"}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {b.status}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-white">
                    {new Date(b.start_time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {b.meeting_link && (
                      <a
                        href={b.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        Join Call 🎥
                      </a>
                    )}
                    {b.intake_token && (
                      <Link
                        to={`/intake/${b.intake_token}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        {b.intake_submission ? "View Intake 📋" : "Fill Intake Form 📋"}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Workout Widget */}
        {(() => {
          let cardBg = "bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)]";
          let circleColor = "bg-[var(--color-steel)]";
          if (todayLog?.completed) {
            circleColor = "bg-emerald-500";
          } else if (todayPlan) {
            circleColor = "bg-[var(--color-signal)]";
          }

          return (
            <div className={`${cardBg} overflow-hidden animate-slide-up shadow-sm`} style={{ animationDelay: "100ms" }}>
              {/* Header Bar */}
              <div className="bg-[var(--color-paper)] px-6 py-4 flex items-center justify-between border-b border-[var(--color-border)]">
                <h2 className="text-[var(--color-ink)] text-base flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${circleColor} animate-pulse`}></span>
                  Today's Session
                </h2>
                <span className="text-[var(--color-steel)] text-xs font-bold uppercase tracking-wider">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              {/* Body Content */}
              <div className="p-6">
                {loading ? (
                  <div className="py-8 flex justify-center"><Spinner /></div>
                ) : todayLog?.completed ? (
                  <div className="text-center py-6 animate-fade-in">
                    <div className="w-14 h-14 bg-white/80 text-success rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200/50 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg text-neutral-900 mb-1">Workout Complete!</h3>
                    <p className="text-sm text-neutral-500 mb-6 font-medium">Great training today. Your progress details have been saved.</p>
                    <Link to={`/client/logs/${todayLog.id}`}>
                      <Button variant="outline" size="sm">View Log Summary</Button>
                    </Link>
                  </div>
                ) : todayPlan ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in">
                    <div className="text-center sm:text-left">
                      <span className="inline-block px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] uppercase font-bold tracking-wider bg-[var(--color-signal)]/10 text-[var(--color-signal)] mb-2">
                        Prescribed Plan
                      </span>
                      <h3 className="text-xl text-[var(--color-ink)] leading-tight mb-1">{todayPlan.title}</h3>
                      <p className="text-sm text-[var(--color-steel)] font-medium">{todayPlan.exercise_count || todayPlan.exercises?.length || 0} exercises waiting for you</p>
                    </div>
                    <Link to={`/client/log-workout?planId=${todayPlan.id}`} className="w-full sm:w-auto">
                      <Button variant="primary" className="w-full justify-center">Start Workout</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 animate-fade-in">
                    <div className="w-14 h-14 bg-white/80 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200/50 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg text-neutral-900 mb-1">Rest Day</h3>
                    <p className="text-sm text-neutral-500 mb-6 font-medium">No scheduled workout plan for today. You can still log an ad-hoc session.</p>
                    <Link to={`/client/log-workout`} className="w-full sm:w-auto">
                      <Button variant="accent" className="w-full justify-center">Log Ad-hoc Workout</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          {/* Journey Widget */}
          <Link to="/client/progress" className="bg-white hover-lift p-8 flex flex-col justify-between border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-paper)] border border-[var(--color-border)] text-[var(--color-ink)] flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl text-[var(--color-ink)] mb-2">Weight & Photos</h3>
              <p className="text-sm text-[var(--color-steel)] font-medium leading-relaxed">
                Log body weights, view metrics charts, and compare progress photos chronologically.
              </p>
            </div>
            <span className="text-[var(--color-ink)] text-sm font-extrabold mt-8 inline-flex items-center gap-1.5 hover:translate-x-1 transition-transform">
              View Log History →
            </span>
          </Link>

          {/* Strength Widget */}
          <Link to="/client/strength" className="bg-white hover-lift p-8 flex flex-col justify-between border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-paper)] border border-[var(--color-border)] text-[var(--color-ink)] flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl text-[var(--color-ink)] mb-2">Strength Analytics</h3>
              <p className="text-sm text-[var(--color-steel)] font-medium leading-relaxed">
                View auto-calculated strength curves for individual exercises logged.
              </p>
            </div>
            <span className="text-[var(--color-ink)] text-sm font-extrabold mt-8 inline-flex items-center gap-1.5 hover:translate-x-1 transition-transform">
              View Metrics →
            </span>
          </Link>

          {/* Coach Notes Widget */}
          <Link to="/client/reviews" className="bg-white hover-lift p-8 flex flex-col justify-between border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-paper)] border border-[var(--color-border)] text-[var(--color-ink)] flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl text-[var(--color-ink)] mb-2">Feedback Feed</h3>
              <p className="text-sm text-[var(--color-steel)] font-medium leading-relaxed">
                Read review summaries and coaching corrections posted directly by your coach.
              </p>
            </div>
            <span className="text-[var(--color-ink)] text-sm font-extrabold mt-8 inline-flex items-center gap-1.5 hover:translate-x-1 transition-transform">
              Read Notes →
            </span>
          </Link>
        </div>

        {/* Workout Calendar Section */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h2 className="text-xl text-[var(--color-ink)] flex items-center gap-2">
            <span>Attendance & Plans</span>
          </h2>
          <WorkoutCalendar clientId={user.id} />
        </div>
      </PageContainer>
    </ClientLayout>
  );
}
