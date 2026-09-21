import React, { useState, useEffect } from "react";
import TrainerLayout from "../components/layout/TrainerLayout";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { getTrainerBookings } from "../api/bookings";

function statusBadgeClass(status) {
  if (status === "CONFIRMED") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (status === "CANCELLED") return "bg-red-500/20 text-red-400 border-red-500/30";
  return "bg-amber-500/20 text-amber-400 border-amber-500/30";
}

function BookingCard({ booking, onViewIntake }) {
  const hasIntake = !!booking.intake_submission;
  return (
    <article className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-bold text-white">{booking.client_name}</h3>
          <p className="truncate text-xs text-white/60">{booking.client_email}</p>
          <p className="text-xs text-white/60">{booking.client_phone}</p>
        </div>
        <span className={`shrink-0 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadgeClass(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Service</div>
          <div className="font-semibold text-blue-400">{booking.service_details?.title || "Coaching Call"}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">When</div>
          <div className="font-semibold text-white">{new Date(booking.start_time).toLocaleDateString()}</div>
          <div className="text-xs text-white/60">
            {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
        {booking.meeting_link ? (
          <a
            href={booking.meeting_link}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-blue-400 underline hover:text-blue-300"
          >
            Join meeting
          </a>
        ) : (
          <span className="text-xs text-white/40">No meeting link</span>
        )}
        <div className="ml-auto">
          {hasIntake ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewIntake(booking.intake_submission)}
              className="px-3 py-1 text-xs"
            >
              View intake
            </Button>
          ) : (
            <span className="text-xs font-medium text-white/40">Intake pending</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function TrainerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIntake, setSelectedIntake] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const data = await getTrainerBookings();
        const list = Array.isArray(data) ? data : (data?.results || []);
        setBookings(list);
      } catch (err) {
        setError("Failed to load client bookings.");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <TrainerLayout>
      <PageContainer variant="dashboard" className="space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] p-5 text-white shadow-lg sm:p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[var(--color-signal)] backdrop-blur-md">
              Client Appointments
            </span>
            <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl md:text-4xl">
              Bookings & Intake Forms
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-white/70 sm:text-base">
              View upcoming coaching and consultation calls and inspect pre-session questionnaire responses.
            </p>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="space-y-3 rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] p-8 text-center text-white/60 sm:p-12">
            <h3 className="text-lg font-bold text-white">No client appointments yet</h3>
            <p className="mx-auto max-w-md text-sm">
              Share your booking link so clients can schedule 1-on-1 coaching and consultation calls.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile / tablet cards */}
            <div className="space-y-3 md:hidden">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} onViewIntake={setSelectedIntake} />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] shadow-xl md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wider text-white/70">
                      <th className="p-4">Client Details</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Scheduled Start Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Video Link</th>
                      <th className="p-4 text-right">Intake Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {bookings.map((b) => {
                      const hasIntake = !!b.intake_submission;
                      return (
                        <tr key={b.id} className="transition-colors hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold text-white">{b.client_name}</div>
                            <div className="text-xs text-white/60">{b.client_email}</div>
                            <div className="text-xs text-white/60">{b.client_phone}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-blue-400">
                              {b.service_details?.title || "Coaching Call"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">
                              {new Date(b.start_time).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-white/60">
                              {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadgeClass(b.status)}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {b.meeting_link ? (
                              <a
                                href={b.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-blue-400 underline hover:text-blue-300"
                              >
                                Join meeting
                              </a>
                            ) : (
                              <span className="text-xs text-white/40">None</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {hasIntake ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSelectedIntake(b.intake_submission)}
                                className="px-3 py-1 text-xs"
                              >
                                View intake
                              </Button>
                            ) : (
                              <span className="text-xs font-medium text-white/40">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {selectedIntake && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4">
            <div className="max-h-[90vh] w-full max-w-xl space-y-6 overflow-y-auto rounded-t-[var(--radius-2xl)] border border-white/15 bg-slate-900 p-5 text-white shadow-2xl sm:rounded-[var(--radius-2xl)] sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">Submitted intake</h2>
                  <p className="mt-0.5 text-xs text-white/60">Form type: {selectedIntake.form_type}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIntake(null)}
                  className="p-1 text-xl font-bold text-white/60 hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(selectedIntake.responses || {}).map(([qKey, val]) => (
                  <div key={qKey} className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      {qKey.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm font-medium text-white">{val ? String(val) : "Not answered"}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 text-right">
                <Button variant="secondary" onClick={() => setSelectedIntake(null)} className="w-full sm:w-auto">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </TrainerLayout>
  );
}
