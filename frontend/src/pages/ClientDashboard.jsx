import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import WorkoutCalendar from "../components/workouts/WorkoutCalendar";
import { workoutsApi } from "../api/workouts";
import { Spinner } from "../components/ui/Spinner";
import ClientLayout from "../components/layout/ClientLayout";

export default function ClientDashboard() {
  const { user } = useAuth();
  
  const [todayPlan, setTodayPlan] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayWorkout();
  }, []);

  const fetchTodayWorkout = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const monthStr = today.substring(0, 7);
      
      const [plansData, logsData] = await Promise.all([
        workoutsApi.getPlans({ month: monthStr }),
        workoutsApi.getLogs({ month: monthStr })
      ]);
      
      const plan = plansData.find(p => p.scheduled_date === today);
      const log = logsData.find(l => l.date === today);
      
      if (plan) setTodayPlan(plan);
      if (log) setTodayLog(log);
    } catch (error) {
      console.error("Failed to fetch today's workout", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Greeting Hero Section */}
        <div className="relative overflow-hidden rounded-3xl hero-gradient p-8 sm:p-10 text-white shadow-lg animate-slide-up">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-orange-300">
              ⚡️ Member Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 text-white">
              Hey, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-white/70 mt-2 text-sm sm:text-base max-w-xl font-medium">
              Welcome back to your personalized training space. Access your schedule, track metrics, log sets, and see your stats grow.
            </p>
          </div>
        </div>

        {/* Today's Workout Widget */}
        {(() => {
          let cardBg = "glass-panel tint-sky border-sky-100/50";
          let circleColor = "bg-sky-400";
          if (todayLog?.completed) {
            cardBg = "glass-panel tint-emerald border-emerald-100/50";
            circleColor = "bg-emerald-400";
          } else if (todayPlan) {
            cardBg = "glass-panel tint-violet border-indigo-100/50";
            circleColor = "bg-indigo-400";
          }

          return (
            <div className={`${cardBg} overflow-hidden animate-slide-up shadow-lg`} style={{ animationDelay: "100ms" }}>
              {/* Header Bar */}
              <div className="bg-neutral-900/90 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
                <h2 className="text-white font-extrabold text-base flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${circleColor} animate-pulse`}></span>
                  Today's Session
                </h2>
                <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">
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
                    <h3 className="text-lg font-extrabold text-neutral-900 mb-1">Workout Complete!</h3>
                    <p className="text-sm text-neutral-500 mb-6 font-medium">Great training today. Your progress details have been saved.</p>
                    <Link to={`/client/logs/${todayLog.id}`}>
                      <Button variant="outline" size="sm">View Log Summary</Button>
                    </Link>
                  </div>
                ) : todayPlan ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in">
                    <div className="text-center sm:text-left">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/70 text-primary border border-indigo-100/50 mb-2">
                        Prescribed Plan
                      </span>
                      <h3 className="text-xl font-extrabold text-neutral-900 leading-tight mb-1">{todayPlan.title}</h3>
                      <p className="text-sm text-neutral-500 font-medium">{todayPlan.exercise_count || todayPlan.exercises?.length || 0} exercises waiting for you</p>
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
                    <h3 className="text-lg font-extrabold text-neutral-900 mb-1">Rest Day</h3>
                    <p className="text-sm text-neutral-500 mb-6 font-medium">No scheduled workout plan for today. You can still log an ad-hoc session.</p>
                    <Link to={`/client/log-workout`} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full justify-center">Log Ad-hoc Workout</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Navigation / Analytics Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          {/* Journey Widget */}
          <Link to="/client/progress" className="glass-panel tint-violet hover-lift p-8 flex flex-col justify-between border-indigo-100/50">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100/50 text-primary flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="font-extrabold text-neutral-900 text-lg mb-2">Weight & Photos</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                Log body weights, view metrics charts, and compare progress photos chronologically.
              </p>
            </div>
            <span className="text-primary text-sm font-extrabold mt-8 inline-flex items-center gap-1.5 hover:translate-x-1 transition-transform">
              View Log History →
            </span>
          </Link>

          {/* Strength Widget */}
          <Link to="/client/strength" className="glass-panel tint-orange hover-lift p-8 flex flex-col justify-between border-orange-100/50">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100/50 text-accent flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-extrabold text-neutral-900 text-lg mb-2">Strength Analytics</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                View auto-calculated strength curves for individual exercises logged.
              </p>
            </div>
            <span className="text-accent text-sm font-extrabold mt-8 inline-flex items-center gap-1.5 hover:translate-x-1 transition-transform">
              View Metrics →
            </span>
          </Link>

          {/* Coach Notes Widget */}
          <Link to="/client/reviews" className="glass-panel tint-emerald hover-lift p-8 flex flex-col justify-between border-emerald-100/50">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/50 text-success flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-neutral-900 text-lg mb-2">Feedback Feed</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                Read review summaries and coaching corrections posted directly by your coach.
              </p>
            </div>
            <span className="text-success text-sm font-extrabold mt-8 inline-flex items-center gap-1.5 hover:translate-x-1 transition-transform">
              Read Notes →
            </span>
          </Link>
        </div>

        {/* Workout Calendar Section */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>Attendance & Plans</span>
          </h2>
          <WorkoutCalendar clientId={user.id} />
        </div>
      </div>
    </ClientLayout>
  );
}
