import React, { useState, useEffect, useCallback } from "react";
import TrainerLayout from "../components/layout/TrainerLayout";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import {
  getTrainerAvailability,
  createTrainerAvailability,
  deleteTrainerAvailability,
  getTrainerBlackouts,
  createTrainerBlackout,
  deleteTrainerBlackout,
} from "../api/bookings";

const SERVICE_CALENDARS = [
  {
    id: "one_on_one_coaching",
    label: "1-on-1 Coaching",
    short: "Coaching",
    description: "Weekly hours shown on the public coaching booking page only.",
  },
  {
    id: "consultation",
    label: "Consultation",
    short: "Consultation",
    description: "Weekly hours shown on the public consultation booking page only.",
  },
];

const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TrainerAvailabilityPage() {
  const [activeCalendar, setActiveCalendar] = useState("one_on_one_coaching");
  const [availabilities, setAvailabilities] = useState([]);
  const [blackouts, setBlackouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const [blackoutStart, setBlackoutStart] = useState("");
  const [blackoutEnd, setBlackoutEnd] = useState("");
  const [blackoutReason, setBlackoutReason] = useState("");

  const activeMeta = SERVICE_CALENDARS.find((c) => c.id === activeCalendar) || SERVICE_CALENDARS[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [availRes, blackRes] = await Promise.all([
        getTrainerAvailability(activeCalendar),
        getTrainerBlackouts(),
      ]);
      setAvailabilities(Array.isArray(availRes) ? availRes : availRes?.results || []);
      setBlackouts(Array.isArray(blackRes) ? blackRes : blackRes?.results || []);
    } catch (err) {
      setError("Failed to load trainer availability data.");
    } finally {
      setLoading(false);
    }
  }, [activeCalendar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }
    try {
      await createTrainerAvailability({
        service_type: activeCalendar,
        day_of_week: parseInt(dayOfWeek, 10),
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        is_active: true,
      });
      setSuccessMsg(`${activeMeta.short} availability rule added.`);
      fetchData();
    } catch (err) {
      const detail = err.response?.data;
      const msg =
        detail?.service_type?.[0] ||
        detail?.non_field_errors?.[0] ||
        detail?.detail ||
        "Failed to add availability rule.";
      setError(typeof msg === "string" ? msg : "Failed to add availability rule.");
    }
  };

  const handleDeleteAvailability = async (id) => {
    setError("");
    setSuccessMsg("");
    try {
      await deleteTrainerAvailability(id);
      setSuccessMsg("Availability rule removed.");
      fetchData();
    } catch (err) {
      setError("Failed to delete availability rule.");
    }
  };

  const handleAddBlackout = async (e) => {
    e.preventDefault();
    if (!blackoutStart || !blackoutEnd) return;
    setError("");
    setSuccessMsg("");
    try {
      await createTrainerBlackout({
        start_datetime: new Date(blackoutStart).toISOString(),
        end_datetime: new Date(blackoutEnd).toISOString(),
        reason: blackoutReason,
      });
      setBlackoutStart("");
      setBlackoutEnd("");
      setBlackoutReason("");
      setSuccessMsg("Blackout block added (applies to all calendars).");
      fetchData();
    } catch (err) {
      setError("Failed to create blackout block.");
    }
  };

  const handleDeleteBlackout = async (id) => {
    setError("");
    setSuccessMsg("");
    try {
      await deleteTrainerBlackout(id);
      setSuccessMsg("Blackout block removed.");
      fetchData();
    } catch (err) {
      setError("Failed to delete blackout block.");
    }
  };

  return (
    <TrainerLayout>
      <PageContainer variant="dashboard" className="space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] p-5 text-white shadow-lg sm:p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[var(--color-signal)] backdrop-blur-md">
              Schedule Settings
            </span>
            <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl md:text-4xl">
              Availability &amp; Blackouts
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-white/70 sm:text-base">
              Manage separate weekly calendars for coaching and consultation. Blackouts block your time across both.
            </p>
          </div>
        </div>

        {/* Calendar tabs */}
        <div
          className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-2 sm:flex-row"
          role="tablist"
          aria-label="Service calendars"
        >
          {SERVICE_CALENDARS.map((cal) => {
            const selected = activeCalendar === cal.id;
            return (
              <button
                key={cal.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActiveCalendar(cal.id);
                  setSuccessMsg("");
                  setError("");
                }}
                className={`flex-1 rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors ${
                  selected
                    ? "bg-[var(--color-ink)] text-white shadow-sm"
                    : "text-[var(--color-ink)] hover:bg-black/5"
                }`}
              >
                <span className="block text-sm font-bold sm:text-base">{cal.label}</span>
                <span className={`mt-0.5 block text-xs ${selected ? "text-white/65" : "text-[var(--color-steel)]"}`}>
                  {cal.description}
                </span>
              </button>
            );
          })}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Weekly hours for active calendar */}
            <div className="space-y-5 rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] p-5 sm:p-8">
              <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  Weekly hours · {activeMeta.short}
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  These windows only appear on the public {activeMeta.short.toLowerCase()} booking flow.
                </p>
              </div>

              <form
                onSubmit={handleAddAvailability}
                className="space-y-4 rounded-[var(--radius-xl)] border border-white/10 bg-white/5 p-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">Day of Week</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      {daysList.map((d, i) => (
                        <option key={d} value={i}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary" className="w-full text-sm">
                  + Add {activeMeta.short} rule
                </Button>
              </form>

              {availabilities.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/5 py-6 text-center text-xs text-white/50">
                  No custom {activeMeta.short.toLowerCase()} rules yet. Until you add rules, public booking uses a
                  default Mon–Fri 9:00–17:00 window for this calendar only.
                </div>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {availabilities.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm"
                    >
                      <div className="min-w-0 font-medium text-white">
                        <span className="font-bold text-blue-400">{daysList[item.day_of_week]}</span>
                        {": "}
                        {String(item.start_time).slice(0, 5)} – {String(item.end_time).slice(0, 5)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAvailability(item.id)}
                        className="shrink-0 rounded px-2 py-1 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared blackouts */}
            <div className="space-y-5 rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] p-5 sm:p-8">
              <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">Date blackouts &amp; leave</h2>
                <p className="mt-1 text-xs text-white/60">
                  Shared across coaching and consultation — blocked time cannot be booked on either calendar.
                </p>
              </div>

              <form
                onSubmit={handleAddBlackout}
                className="space-y-4 rounded-[var(--radius-xl)] border border-white/10 bg-white/5 p-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">Start</label>
                    <input
                      type="datetime-local"
                      required
                      value={blackoutStart}
                      onChange={(e) => setBlackoutStart(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">End</label>
                    <input
                      type="datetime-local"
                      required
                      value={blackoutEnd}
                      onChange={(e) => setBlackoutEnd(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/70">Reason (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Personal holiday, conference"
                    value={blackoutReason}
                    onChange={(e) => setBlackoutReason(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full border border-red-500/30 bg-red-500/20 text-sm text-red-300 hover:bg-red-500/30"
                >
                  + Add blackout block
                </Button>
              </form>

              {blackouts.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/5 py-6 text-center text-xs text-white/50">
                  No active blackout blocks set.
                </div>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {blackouts.map((blk) => (
                    <div
                      key={blk.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-red-400">{blk.reason || "Unavailable range"}</div>
                        <div className="mt-0.5 text-xs text-white/60">
                          {new Date(blk.start_datetime).toLocaleString()} –{" "}
                          {new Date(blk.end_datetime).toLocaleString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlackout(blk.id)}
                        className="shrink-0 rounded px-2 py-1 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </TrainerLayout>
  );
}
