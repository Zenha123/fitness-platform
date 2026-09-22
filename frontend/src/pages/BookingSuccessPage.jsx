import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const booking = location.state?.booking;

  const meetingLink = booking?.meeting_link || null;
  const intakeToken = booking?.intake_token;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Navbar />

      <PageContainer variant="narrow" className="px-3 sm:px-6 py-6 sm:py-12">
        <div className="space-y-6 rounded-[var(--radius-2xl)] border border-white/10 bg-white/5 p-4 sm:p-8 md:p-12 text-center shadow-2xl sm:space-y-8">


          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-3xl text-emerald-400 sm:h-20 sm:w-20 sm:text-4xl">
            ✓
          </div>

          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">Booking Confirmed</h1>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-white/70 sm:text-base">
              Your session is locked in. A confirmation email with your join link, intake form, and calendar invite has been sent.
            </p>
            {bookingId && (
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-white/40">
                Ref {String(bookingId).slice(0, 8)}
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Service</span>
                <div className="mt-0.5 text-base font-bold text-white">
                  {booking?.service_details?.title || "Coaching / Consultation Session"}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Client Name</span>
                <div className="mt-0.5 text-sm font-semibold text-white">
                  {booking?.client_name || "Guest Client"}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Scheduled Date & Time</span>
                <div className="mt-0.5 text-sm font-semibold text-blue-400">
                  {booking?.start_time ? new Date(booking.start_time).toLocaleString() : "Confirmed Slot"}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Video Link</span>
                <div className="mt-0.5 break-all">
                  {meetingLink ? (
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-blue-400 underline hover:text-blue-300"
                    >
                      Join session
                    </a>
                  ) : (
                    <span className="text-sm text-white/50">Check your confirmation email</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {booking?.assessment_report?.is_released && (
            <div className="space-y-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-left sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-emerald-400">📄 Your Assessment Report is Ready!</h3>
                <span className="text-xs font-semibold text-emerald-300">✓ Released</span>
              </div>
              <p className="text-xs text-white/80">
                Your coach has published your official Goal & Baseline Assessment Report.
              </p>
              <a
                href={`/api/bookings/reports/${booking.assessment_report.id}/pdf/?token=${booking.intake_token}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <Button variant="primary" size="sm" className="text-xs font-bold py-2 px-4">
                  📥 Download Assessment Report PDF
                </Button>
              </a>
            </div>
          )}

          {intakeToken && (
            <div className="space-y-4 rounded-xl border border-[var(--color-signal)]/40 bg-[var(--color-signal)]/15 p-4 sm:p-6">
              <h3 className="text-base font-bold text-[var(--color-signal)] sm:text-lg">Next step: complete intake</h3>
              <p className="mx-auto max-w-md text-xs font-medium text-white/70 sm:text-sm">
                Please complete your pre-session questionnaire before the call so your coach can prepare.
              </p>
              <Link to={`/intake/${intakeToken}`} className="inline-block w-full sm:w-auto">
                <Button variant="primary" className="w-full px-8 py-3 shadow-lg sm:w-auto">
                  Complete intake questionnaire
                </Button>
              </Link>
            </div>
          )}


          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-center">
            <Link to="/" className="inline-block w-full sm:w-auto">
              <Button
                variant="ghost"
                className="w-full border border-white/20 text-xs text-white/80 hover:bg-white/5 hover:text-white sm:w-auto"
              >
                Back to Home
              </Button>
            </Link>
            <Link to="/login" className="inline-block w-full sm:w-auto">
              <Button
                variant="ghost"
                className="w-full border border-white/20 text-xs text-white/80 hover:bg-white/5 hover:text-white sm:w-auto"
              >
                Client / Trainer Login
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
