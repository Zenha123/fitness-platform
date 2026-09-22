import React, { useState, useEffect, useMemo } from "react";
import TrainerLayout from "../components/layout/TrainerLayout";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import {
  getTrainerBookings,
  saveAssessmentReport,
  releaseAssessmentReport,
  downloadAssessmentReportPdf,
} from "../api/bookings";

function statusBadgeClass(status) {
  if (status === "CONFIRMED") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (status === "CANCELLED") return "bg-red-500/20 text-red-300 border-red-500/40";
  return "bg-amber-500/20 text-amber-300 border-amber-500/40";
}

function formatQuestionKey(key) {
  const map = {
    full_name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    age: "Age",
    gender: "Gender",
    emergency_contact_name: "Emergency Contact Name",
    emergency_contact_phone: "Emergency Contact Phone",
    health_conditions: "Diagnosed Medical Conditions",
    health_history_details: "Medical History Details",
    has_injuries: "Has Current Injuries / Limitations",
    injuries_details: "Injury / Limitation Details",
    takes_medications: "Takes Prescription Medications",
    medications_details: "Medication Details",
    parq_heart_condition: "PAR-Q #1: Doctor-diagnosed heart condition",
    parq_chest_pain_activity: "PAR-Q #2: Chest pain during activity",
    parq_chest_pain_resting: "PAR-Q #3: Chest pain at rest",
    parq_dizziness_consciousness: "PAR-Q #4: Dizziness / loss of balance",
    parq_bone_joint_problem: "PAR-Q #5: Bone / joint condition",
    parq_bp_heart_meds: "PAR-Q #6: Blood pressure / heart meds",
    parq_other_reason: "PAR-Q #7: Other reason against exercise",
    parq_details: "PAR-Q Medical Details",
    occupation: "Occupation",
    sedentary_hours_per_day: "Daily Sedentary Hours",
    travel_frequency: "Work Travel Frequency",
    stress_level: "Daily Stress Level",
    sleep_hours_per_night: "Sleep Per Night",
    current_activity_level: "Current Activity Level",
    exercise_frequency: "Current Exercise Frequency",
    past_exercise_experience: "Past Exercise Experience",
    equipment_access: "Equipment Access",
    primary_goal: "Primary Fitness Goal",
    goal_details: "Goal Description & Details",
    target_timeline: "Target Timeline",
  };
  return map[key] || key.replace(/_/g, " ").toUpperCase();
}

function IntakeStatusBadge({ submission }) {
  if (!submission) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
        ⏳ Intake Pending
      </span>
    );
  }

  if (submission.has_risk_flags) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-500/25 px-2.5 py-1 text-[11px] font-black text-red-300 uppercase tracking-wide">
        <span className="animate-pulse">⚠️</span> Risk Flagged
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
      ✓ Intake Completed
    </span>
  );
}

function ReportStatusBadge({ report }) {
  if (!report) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
        No Report
      </span>
    );
  }

  if (report.is_released) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
        ✓ PDF Released
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300">
      📄 Draft Saved
    </span>
  );
}

function BookingCard({ booking, onViewIntake, onOpenReport }) {
  const hasIntake = !!booking.intake_submission;
  const isRiskFlagged = booking.intake_submission?.has_risk_flags;
  const report = booking.assessment_report;

  return (
    <article className="space-y-4 rounded-2xl border border-white/10 bg-[#0B0B0C] p-4 sm:p-5 shadow-xl text-white">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="font-black text-white text-base sm:text-lg leading-tight truncate">
            {booking.client_name}
          </h3>
          <div className="text-xs text-slate-400 break-all font-medium">{booking.client_email}</div>
          <div className="text-xs text-slate-400 font-medium">{booking.client_phone}</div>
        </div>
        <div className="shrink-0">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-wider ${statusBadgeClass(booking.status)}`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2">
        <IntakeStatusBadge submission={booking.intake_submission} />
        <ReportStatusBadge report={report} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Category</div>
          <div className="font-black text-[var(--color-signal)] text-sm truncate">
            {booking.service_details?.title || "Coaching Session"}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Session Time</div>
          <div className="font-bold text-white text-sm">
            {new Date(booking.start_time).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="space-y-3 border-t border-white/10 pt-3">
        {booking.meeting_link ? (
          <a
            href={booking.meeting_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 transition-colors"
          >
            <span>📹 Join Video Call</span>
          </a>
        ) : (
          <span className="text-xs text-slate-500 italic">No video meeting link</span>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {hasIntake && (
            <Button
              variant={isRiskFlagged ? "danger" : "secondary"}
              size="sm"
              onClick={() => onViewIntake(booking.intake_submission)}
              className="w-full justify-center text-xs font-bold py-2.5"
            >
              {isRiskFlagged ? "⚠️ Risk Intake" : "View Intake"}
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenReport(booking)}
            className={`w-full justify-center text-xs font-bold py-2.5 ${!hasIntake ? "sm:col-span-2" : ""}`}
          >
            {report ? (report.is_released ? "📄 View PDF Report" : "📝 Edit PDF Report") : "📄 + PDF Report"}
          </Button>
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
  const [reportBooking, setReportBooking] = useState(null);
  const [filterTab, setFilterTab] = useState("upcoming");

  // Report Form State
  const [reportData, setReportData] = useState({
    goals_summary: "",
    baseline_assessment: "",
    recommended_program: "",
    suggested_timeline: "",
    trainer_notes: "",
  });
  const [savingReport, setSavingReport] = useState(false);
  const [releasingReport, setReleasingReport] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const fetchBookings = async () => {
    try {
      const data = await getTrainerBookings();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setBookings(list);
    } catch (err) {
      setError("Failed to load client bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const counts = useMemo(() => {
    const now = new Date();
    let upcoming = 0;
    let past = 0;
    let flagged = 0;

    bookings.forEach((b) => {
      const startTime = new Date(b.start_time);
      if (startTime >= now && b.status !== "CANCELLED") {
        upcoming += 1;
      } else {
        past += 1;
      }
      if (b.intake_submission?.has_risk_flags) {
        flagged += 1;
      }
    });

    return { upcoming, past, all: bookings.length, flagged };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      const startTime = new Date(b.start_time);
      if (filterTab === "upcoming") {
        return startTime >= now && b.status !== "CANCELLED";
      }
      if (filterTab === "past") {
        return startTime < now || b.status === "COMPLETED";
      }
      return true;
    });
  }, [bookings, filterTab]);

  const handleOpenReportModal = (booking) => {
    setReportBooking(booking);
    setReportError("");
    setReportSuccess("");

    const existingReport = booking.assessment_report;
    const intake = booking.intake_submission?.responses || {};

    if (existingReport) {
      setReportData({
        goals_summary: existingReport.goals_summary || "",
        baseline_assessment: existingReport.baseline_assessment || "",
        recommended_program: existingReport.recommended_program || "",
        suggested_timeline: existingReport.suggested_timeline || "",
        trainer_notes: existingReport.trainer_notes || "",
      });
    } else {
      // Auto-populate draft from client intake submission (§5.7)
      const primaryGoal = intake.primary_goal || "Fat Loss & Athletic Performance";
      const goalDetails = intake.goal_details ? `\nDetails: ${intake.goal_details}` : "";

      let baseline = `Activity Level: ${intake.current_activity_level || "Lightly Active"}\nExercise Frequency: ${intake.exercise_frequency || "1-2 days/week"}\nEquipment: ${intake.equipment_access || "Commercial Gym"}`;
      if (intake.health_conditions && intake.health_conditions.length > 0) {
        baseline += `\nDiagnosed Conditions: ${intake.health_conditions.join(", ")}`;
      }
      if (booking.intake_submission?.has_risk_flags) {
        baseline += `\n⚠️ PAR-Q Medical Alert: Client flagged medical risk factors during intake. Physician approval recommended.`;
      }

      setReportData({
        goals_summary: `${primaryGoal}${goalDetails}`,
        baseline_assessment: baseline,
        recommended_program: "3-4 Day Progressive Strength & Functional Fitness Protocol. Focus on compound movements, core stability, and cardio conditioning.",
        suggested_timeline: intake.target_timeline || "3-6 Months Structured Evaluation Roadmap with bi-weekly milestone checks.",
        trainer_notes: "Please review exercises and rest periods prior to starting each cycle. Stay hydrated and monitor recovery.",
      });
    }
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!reportBooking) return;
    setSavingReport(true);
    setReportError("");
    setReportSuccess("");

    try {
      const payload = {
        booking_id: reportBooking.id,
        ...reportData,
      };
      await saveAssessmentReport(payload);
      setReportSuccess("Assessment report saved & draft PDF generated!");
      await fetchBookings();
    } catch (err) {
      setReportError(err.response?.data?.error || "Failed to save assessment report.");
    } finally {
      setSavingReport(false);
    }
  };

  const handleReleaseReport = async () => {
    if (!reportBooking) return;
    setReleasingReport(true);
    setReportError("");
    setReportSuccess("");

    try {
      // First save current values
      const savePayload = {
        booking_id: reportBooking.id,
        ...reportData,
      };
      const saved = await saveAssessmentReport(savePayload);
      // Release report and email PDF to client
      await releaseAssessmentReport(saved.id);
      setReportSuccess(`PDF Assessment Report officially released and emailed to ${reportBooking.client_email}!`);
      await fetchBookings();
    } catch (err) {
      setReportError(err.response?.data?.error || "Failed to release assessment report.");
    } finally {
      setReleasingReport(false);
    }
  };

  const handleDownloadPdf = async (reportId) => {
    setDownloadingPdf(true);
    setReportError("");
    try {
      const blobUrl = await downloadAssessmentReportPdf(reportId);
      window.open(blobUrl, "_blank");
      // Revoke after a delay to allow the browser to load the blob
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      setReportError("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <TrainerLayout>
      <PageContainer variant="dashboard" className="space-y-6 sm:space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-[#0B0B0C] p-5 text-white shadow-lg sm:p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-signal)]/30 bg-[var(--color-signal)]/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[var(--color-signal)] backdrop-blur-md">
              Client Roster & Schedule
            </span>
            <h1 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">
              Bookings & PDF Assessment Reports
            </h1>
            <p className="max-w-xl text-sm font-medium text-white/70 sm:text-base">
              Manage client appointments, inspect pre-session intake forms, and generate branded PDF Goal & Baseline Assessment Reports for your clients.
            </p>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="space-y-3 rounded-[var(--radius-2xl)] border border-white/10 bg-[#0B0B0C] p-8 text-center text-white/60 sm:p-12">
            <h3 className="text-lg font-bold text-white">No client appointments scheduled</h3>
            <p className="mx-auto max-w-md text-sm">
              Share your booking link so clients can schedule 1-on-1 coaching and consultation calls.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Tabs Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                <button
                  type="button"
                  onClick={() => setFilterTab("upcoming")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    filterTab === "upcoming"
                      ? "bg-[var(--color-signal)] text-white shadow-md border border-transparent"
                      : "bg-white text-[var(--color-ink)] hover:bg-slate-100 border border-[var(--color-border)] shadow-sm"
                  }`}
                >
                  Upcoming ({counts.upcoming})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("past")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    filterTab === "past"
                      ? "bg-[var(--color-signal)] text-white shadow-md border border-transparent"
                      : "bg-white text-[var(--color-ink)] hover:bg-slate-100 border border-[var(--color-border)] shadow-sm"
                  }`}
                >
                  Past ({counts.past})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    filterTab === "all"
                      ? "bg-[var(--color-signal)] text-white shadow-md border border-transparent"
                      : "bg-white text-[var(--color-ink)] hover:bg-slate-100 border border-[var(--color-border)] shadow-sm"
                  }`}
                >
                  All ({counts.all})
                </button>
              </div>

              {counts.flagged > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-600 shrink-0">
                  <span>⚠️ {counts.flagged} Medical Risk Alert{counts.flagged > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>

            {filteredBookings.length === 0 ? (
              <div className="rounded-[var(--radius-2xl)] border border-white/10 bg-[#0B0B0C] p-8 text-center text-white/60">
                <p className="text-sm font-semibold">No {filterTab} bookings found.</p>
              </div>
            ) : (
              <>
                {/* Mobile / Tablet Card View */}
                <div className="space-y-4 md:hidden">
                  {filteredBookings.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      onViewIntake={setSelectedIntake}
                      onOpenReport={handleOpenReportModal}
                    />
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-[#0B0B0C] shadow-xl md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wider text-white/70">
                          <th className="p-4">Client Details</th>
                          <th className="p-4">Service</th>
                          <th className="p-4">Scheduled Start Time</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Intake Status</th>
                          <th className="p-4">PDF Report Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredBookings.map((b) => {
                          const hasIntake = !!b.intake_submission;
                          const isRiskFlagged = b.intake_submission?.has_risk_flags;
                          const report = b.assessment_report;
                          return (
                            <tr key={b.id} className="transition-colors hover:bg-white/5">
                              <td className="p-4">
                                <div className="font-bold text-white">{b.client_name}</div>
                                <div className="text-xs text-white/60 break-all">{b.client_email}</div>
                                <div className="text-xs text-white/60">{b.client_phone}</div>
                              </td>
                              <td className="p-4">
                                <span className="font-semibold text-[var(--color-signal)]">
                                  {b.service_details?.title || "Coaching Session"}
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
                                <IntakeStatusBadge submission={b.intake_submission} />
                              </td>
                              <td className="p-4">
                                <ReportStatusBadge report={report} />
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {hasIntake && (
                                    <Button
                                      variant={isRiskFlagged ? "danger" : "secondary"}
                                      size="sm"
                                      onClick={() => setSelectedIntake(b.intake_submission)}
                                      className="px-2.5 py-1 text-xs font-bold"
                                    >
                                      {isRiskFlagged ? "⚠️ Intake" : "Intake"}
                                    </Button>
                                  )}

                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleOpenReportModal(b)}
                                    className="px-3 py-1 text-xs font-bold"
                                  >
                                    {report ? (report.is_released ? "📄 PDF Report" : "📝 Edit Report") : "📄 + PDF Report"}
                                  </Button>
                                </div>
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
          </div>
        )}

        {/* 1. Intake Modal */}
        {selectedIntake && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-md animate-fade-in">
            <div className="flex flex-col max-h-[90vh] sm:max-h-[88vh] w-full max-w-2xl rounded-t-2xl sm:rounded-2xl border border-white/15 bg-slate-950 text-white shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-6 bg-slate-950">
                <div>
                  <h2 className="text-base sm:text-xl font-black text-white">Client Pre-Session Intake</h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Form Type: <span className="font-bold text-[var(--color-signal)]">{selectedIntake.form_type}</span> | Submitted: {new Date(selectedIntake.submitted_at).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIntake(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xl font-bold transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {selectedIntake.has_risk_flags && (
                  <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <span>⚠️ MEDICAL RISK FACTORS FLAGGED</span>
                    </div>
                    <p className="text-xs text-red-200/90 leading-relaxed">
                      The client flagged 1 or more PAR-Q medical / health risk factors during intake. Physician approval or medical clearance is recommended prior to session execution.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-red-300 font-semibold pt-1">
                      {(selectedIntake.risk_flags || []).map((rf, idx) => (
                        <li key={idx}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {Object.entries(selectedIntake.responses || {}).map(([qKey, val]) => {
                    const displayVal = Array.isArray(val)
                      ? val.join(", ")
                      : val !== null && val !== undefined
                      ? String(val)
                      : "Not specified";

                    const isParqKey = qKey.startsWith("parq_");
                    const isYes = isParqKey && String(val).toLowerCase() === "yes";

                    return (
                      <div
                        key={qKey}
                        className={`space-y-1 rounded-xl border p-3.5 ${
                          isYes
                            ? "border-amber-500/50 bg-amber-500/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-signal)] flex items-center justify-between">
                          <span>{formatQuestionKey(qKey)}</span>
                          {isYes && <span className="text-amber-400 font-black text-[10px]">⚠️ YES</span>}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-white whitespace-pre-wrap">{displayVal || "—"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex-shrink-0 border-t border-white/10 p-4 sm:p-5 bg-slate-950 text-right">
                <Button variant="secondary" onClick={() => setSelectedIntake(null)} className="w-full sm:w-auto font-bold text-xs py-2.5">
                  Close Intake View
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Assessment Report Generation / Edit Modal (§5.7) */}
        {reportBooking && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-md animate-fade-in">
            <div className="flex flex-col max-h-[90vh] sm:max-h-[88vh] w-full max-w-2xl rounded-t-2xl sm:rounded-2xl border border-white/15 bg-[#0B0B0C] text-white shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-6 bg-[#0B0B0C]">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-signal)]/15 border border-[var(--color-signal)]/30 px-2.5 py-0.5 text-[10px] font-black text-[var(--color-signal)] uppercase tracking-wider">
                    Phase 1 §5.7 Assessment Report
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-white mt-1 leading-snug">
                    {reportBooking.assessment_report ? "Edit Assessment Report" : "Generate Client Assessment Report"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Client: <span className="text-white font-bold">{reportBooking.client_name}</span> ({reportBooking.client_email})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReportBooking(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xl font-bold transition-colors"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {reportError && <Alert variant="danger">{reportError}</Alert>}
                {reportSuccess && <Alert variant="success">{reportSuccess}</Alert>}

                <form id="assessment-report-form" onSubmit={handleSaveReport} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">1. Client Goals Summary *</label>
                    <textarea
                      rows={3}
                      required
                      value={reportData.goals_summary}
                      onChange={(e) => setReportData({ ...reportData, goals_summary: e.target.value })}
                      placeholder="Summary of client's primary fitness goals and target achievements..."
                      className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-signal)] transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">2. Current Baseline Assessment *</label>
                    <textarea
                      rows={3}
                      required
                      value={reportData.baseline_assessment}
                      onChange={(e) => setReportData({ ...reportData, baseline_assessment: e.target.value })}
                      placeholder="Current fitness baseline, posture, equipment access, injuries, or PAR-Q findings..."
                      className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-signal)] transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">3. Recommended Program Direction *</label>
                    <textarea
                      rows={3}
                      required
                      value={reportData.recommended_program}
                      onChange={(e) => setReportData({ ...reportData, recommended_program: e.target.value })}
                      placeholder="Custom training protocol, split frequency, intensity, and exercise selection..."
                      className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-signal)] transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">4. Suggested Timeline & Evaluation Milestones *</label>
                    <textarea
                      rows={2}
                      required
                      value={reportData.suggested_timeline}
                      onChange={(e) => setReportData({ ...reportData, suggested_timeline: e.target.value })}
                      placeholder="Suggested timeline, re-evaluation schedule, and target milestones..."
                      className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-signal)] transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">5. Trainer Advisory Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={reportData.trainer_notes}
                      onChange={(e) => setReportData({ ...reportData, trainer_notes: e.target.value })}
                      placeholder="Additional advisory notes, lifestyle tips, or nutrition guidance..."
                      className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-signal)] transition-colors placeholder:text-slate-500"
                    />
                  </div>
                </form>
              </div>

              {/* Modal Sticky Footer Actions */}
              <div className="flex-shrink-0 border-t border-white/10 p-3.5 sm:p-5 bg-[#0B0B0C]">
                <div className="flex flex-col gap-2">
                  {/* Row 1: Primary Actions (Save & Release) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      type="submit"
                      form="assessment-report-form"
                      variant="secondary"
                      disabled={savingReport || releasingReport || downloadingPdf}
                      className="w-full text-xs py-2.5 font-bold justify-center"
                    >
                      {savingReport ? "Saving Draft..." : "💾 Save Draft PDF"}
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleReleaseReport}
                      disabled={savingReport || releasingReport || downloadingPdf}
                      className="w-full text-xs py-2.5 font-bold justify-center shadow-lg"
                    >
                      {releasingReport ? "Releasing PDF..." : "📧 Release & Email PDF"}
                    </Button>
                  </div>

                  {/* Row 2: Download / Preview PDF (Always accessible on mobile & desktop) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (reportBooking.assessment_report?.id) {
                        handleDownloadPdf(reportBooking.assessment_report.id);
                      } else {
                        // If no report saved yet, submit form first to save & download
                        document.getElementById("assessment-report-form")?.requestSubmit();
                      }
                    }}
                    disabled={downloadingPdf || savingReport || releasingReport}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {downloadingPdf ? "Opening PDF..." : "📥 Download / Preview PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </TrainerLayout>
  );
}
