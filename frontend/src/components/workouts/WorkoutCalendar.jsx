import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { workoutsApi } from "../../api/workouts";
import { Spinner } from "../ui/Spinner";
import { useAuth } from "../../context/AuthContext";

export default function WorkoutCalendar({ clientId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClient = user?.role === "client";
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthData();
  }, [currentDate, clientId]);

  const fetchMonthData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      
      const [plansData, logsData] = await Promise.all([
        workoutsApi.getPlans({ client: clientId, month: monthStr }),
        workoutsApi.getLogs({ client: clientId, month: monthStr })
      ]);
      
      setPlans(plansData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch calendar data", err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      const dayPlans = plans.filter(p => p.scheduled_date === dateStr);
      const dayLogs = logs.filter(l => l.date === dateStr);
      
      let status = "neutral";
      if (dayLogs.some(l => l.completed)) {
        status = "completed";
      } else if (dayPlans.length > 0 && dateStr < todayStr) {
        status = "missed";
      } else if (dayPlans.length > 0) {
        status = "scheduled";
      }
      
      days.push({
        day: i,
        dateStr,
        isToday: todayStr === dateStr,
        plans: dayPlans,
        logs: dayLogs,
        status
      });
    }
    return days;
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading && plans.length === 0 && logs.length === 0) {
    return <div className="py-20 flex justify-center"><Spinner /></div>;
  }

  return (
    <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="text-lg text-[var(--color-ink)]">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-[var(--radius-md)] hover:bg-black/5 text-[var(--color-steel)] transition-colors border border-[var(--color-border)] bg-white">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-[var(--radius-md)] hover:bg-black/5 text-[var(--color-steel)] transition-colors border border-[var(--color-border)] bg-white">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-[1px] bg-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)]">
          {weekDays.map(day => (
            <div key={day} className="bg-black/5 text-center py-2.5 text-xs font-bold text-[var(--color-steel)] uppercase tracking-widest">
              {day}
            </div>
          ))}

          {days.map((dayObj, i) => {
            if (!dayObj) {
              return <div key={i} className="min-h-[100px] bg-white/80 p-2 relative group transition-colors"></div>;
            }
            
            let bgClass = "bg-white hover:bg-neutral-50";
            if (dayObj.status === 'completed') bgClass = "bg-emerald-50 hover:bg-emerald-100/80";
            else if (dayObj.status === 'missed') bgClass = "bg-rose-50/50 hover:bg-rose-100/60";
            
            return (
              <div 
                key={i} 
                className={`min-h-[100px] p-2 relative group transition-all duration-300 ${bgClass}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    dayObj.isToday ? 'bg-[var(--color-signal)] text-white' : 'text-[var(--color-ink)]'
                  }`}>
                    {dayObj.day}
                  </span>
                  
                  {!isClient && (
                    <Link 
                      to={`/trainer/schedule?client=${clientId}&date=${dayObj.dateStr}`}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-steel)] hover:bg-black/5 rounded transition-all"
                      title="Schedule workout here"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                <div className="space-y-1">
                  {dayObj.plans.map(plan => {
                    const log = dayObj.logs.find(l => l.plan === plan.id);

                    let linkTo;
                    if (log?.completed) {
                      linkTo = isClient ? `/client/logs/${log.id}` : `/trainer/logs/${log.id}`;
                    } else if (log) {
                      linkTo = isClient ? `/client/log-workout?logId=${log.id}` : `#`;
                    } else {
                      linkTo = isClient
                        ? `/client/log-workout?planId=${plan.id}`
                        : `/trainer/schedule/${plan.id}?client=${clientId}`;
                    }

                    let itemClass = "bg-black/5 hover:bg-black/10 text-[var(--color-ink)] border-[var(--color-border)]";
                    if (log?.completed) {
                      itemClass = "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200";
                    } else if (dayObj.status === 'missed') {
                      itemClass = "bg-neutral-100 hover:bg-neutral-200 text-neutral-500 border-neutral-200";
                    }

                    return (
                      <Link 
                        key={plan.id}
                        to={linkTo}
                        className={`block px-2 py-1 text-xs font-medium rounded-[var(--radius-sm)] truncate transition-colors border ${itemClass}`}
                        title={plan.title}
                      >
                        {plan.title}
                      </Link>
                    );
                  })}
                  
                  {dayObj.logs.filter(l => !l.plan).map(log => {
                    const adHocLink = log.completed
                      ? (isClient ? `/client/logs/${log.id}` : `/trainer/logs/${log.id}`)
                      : (isClient ? `/client/log-workout?logId=${log.id}` : `#`);

                    return (
                      <Link 
                        key={log.id}
                        to={adHocLink}
                        className="block px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-medium rounded-[var(--radius-sm)] truncate transition-colors border border-emerald-200"
                        title={log.completed ? "Ad-hoc Workout (Completed)" : "Ad-hoc Workout (Draft)"}
                      >
                        {log.completed ? "✓ Ad-hoc Workout" : "Ad-hoc Workout"}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
