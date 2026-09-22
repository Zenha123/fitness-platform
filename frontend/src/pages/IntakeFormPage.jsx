import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getIntakeForm, submitIntakeForm } from "../api/bookings";
import Navbar from "../components/Navbar";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";

const HEALTH_CONDITIONS_OPTIONS = [
  "High Blood Pressure",
  "Heart Disease / Cardiovascular Condition",
  "Stroke / TIA",
  "Diabetes (Type 1 or 2)",
  "Asthma / Respiratory Issues",
  "Arthritis / Joint Disease",
  "Chronic Back / Spinal Issues",
  "Frequent Dizziness / Vertigo",
  "None of the above",
];

const PARQ_QUESTIONS = [
  {
    key: "parq_heart_condition",
    question: "1. Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?",
  },
  {
    key: "parq_chest_pain_activity",
    question: "2. Do you feel pain in your chest when you do physical activity?",
  },
  {
    key: "parq_chest_pain_resting",
    question: "3. In the past month, have you had chest pain when you were not doing physical activity?",
  },
  {
    key: "parq_dizziness_consciousness",
    question: "4. Do you lose your balance because of dizziness or do you ever lose consciousness?",
  },
  {
    key: "parq_bone_joint_problem",
    question: "5. Do you have a bone or joint problem (e.g., back, knee, hip) that could be made worse by a change in your physical activity?",
  },
  {
    key: "parq_bp_heart_meds",
    question: "6. Is your doctor currently prescribing drugs (e.g., water pills, beta blockers) for your blood pressure or heart condition?",
  },
  {
    key: "parq_other_reason",
    question: "7. Do you know of any other reason why you should not do physical activity?",
  },
];

export default function IntakeFormPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    health_conditions: [],
    health_history_details: "",
    has_injuries: "no",
    injuries_details: "",
    takes_medications: "no",
    medications_details: "",
    parq_heart_condition: "no",
    parq_chest_pain_activity: "no",
    parq_chest_pain_resting: "no",
    parq_dizziness_consciousness: "no",
    parq_bone_joint_problem: "no",
    parq_bp_heart_meds: "no",
    parq_other_reason: "no",
    parq_details: "",
    occupation: "",
    sedentary_hours_per_day: "6-8 hours",
    travel_frequency: "Occasionally",
    stress_level: "Moderate",
    sleep_hours_per_night: "7-8 hours",
    current_activity_level: "Lightly Active",
    exercise_frequency: "1-2 days/week",
    past_exercise_experience: "",
    equipment_access: "Commercial Gym",
    primary_goal: "Fat Loss & Toning",
    goal_details: "",
    target_timeline: "3-6 months",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    async function fetchForm() {
      try {
        const data = await getIntakeForm(token);
        setFormData(data);
        if (data.client_name) {
          setResponses((prev) => ({
            ...prev,
            full_name: data.client_name || "",
            email: data.client_email || "",
          }));
        }
        if (data.already_submitted) {
          setSubmitted(true);
          setResponses((prev) => ({
            ...prev,
            ...(data.submission?.responses || {}),
          }));
        }
      } catch (err) {
        setError("Invalid or expired intake form link.");
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [token]);

  const handleChange = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxToggle = (condition) => {
    setResponses((prev) => {
      const current = prev.health_conditions || [];
      if (condition === "None of the above") {
        return { ...prev, health_conditions: ["None of the above"] };
      }
      const filtered = current.filter((c) => c !== "None of the above");
      const exists = filtered.includes(condition);
      const next = exists ? filtered.filter((c) => c !== condition) : [...filtered, condition];
      return { ...prev, health_conditions: next };
    });
  };

  const hasParqYes = PARQ_QUESTIONS.some((q) => responses[q.key] === "yes");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setError("");

    if (hasParqYes && !responses.parq_details?.trim()) {
      setValidationError("Since you answered 'Yes' to one or more PAR-Q questions, please provide details in the PAR-Q explanation section below.");
      return;
    }

    if (responses.has_injuries === "yes" && !responses.injuries_details?.trim()) {
      setValidationError("Please specify details about your current injuries or physical limitations.");
      return;
    }

    if (responses.takes_medications === "yes" && !responses.medications_details?.trim()) {
      setValidationError("Please specify details about your current medications.");
      return;
    }

    setSubmitting(true);
    try {
      await submitIntakeForm(token, responses);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit intake form.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-white">
        <Navbar />
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-white">
        <Navbar />
        <PageContainer variant="narrow" className="py-12">
          <Alert variant="danger">{error}</Alert>
          <div className="text-center mt-6">
            <Link to="/" className="text-blue-400 underline font-semibold text-sm">
              Return Home
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Navbar />

      <PageContainer variant="narrow" className="py-4 sm:py-8 px-3 sm:px-6">
        <div className="rounded-[var(--radius-2xl)] bg-white/5 border border-white/10 p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8 shadow-xl">
          {/* Form Header */}
          <div className="border-b border-white/10 pb-5 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md bg-[var(--color-signal)]/15 border border-[var(--color-signal)]/30 px-2.5 py-1 text-[11px] font-bold text-[var(--color-signal)] uppercase tracking-wider">
              Phase 1 Pre-Session Assessment
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white">Client Health & Fitness Intake</h1>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 text-xs sm:text-sm text-white/70">
              <div className="break-words">
                Client: <span className="text-white font-bold">{formData?.client_name}</span>{" "}
                <span className="text-white/50 text-[11px] font-normal break-all">({formData?.client_email})</span>
              </div>
              <div className="hidden sm:inline text-white/20">•</div>
              <div>
                Service: <span className="text-[var(--color-signal)] font-bold">{formData?.service_title}</span>
              </div>
            </div>
          </div>



          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-white">Intake Form Submitted Successfully</h2>
              <p className="text-sm text-white/70 max-w-md mx-auto">
                Thank you for completing your pre-session details. Your trainer has received your responses and will review them before your call.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && <Alert variant="danger">{error}</Alert>}
              {validationError && <Alert variant="danger">{validationError}</Alert>}

              {/* 1. Personal & Contact Details */}
              <div className="space-y-4 border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center border border-blue-500/30 font-black">1</span>
                  Personal & Emergency Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={responses.full_name}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={responses.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={responses.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-white/80">Age *</label>
                      <input
                        type="number"
                        required
                        min="16"
                        max="100"
                        value={responses.age}
                        onChange={(e) => handleChange("age", e.target.value)}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g. 32"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-white/80">Gender</label>
                      <select
                        value={responses.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Emergency Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={responses.emergency_contact_name}
                      onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      placeholder="Name of contact"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Emergency Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={responses.emergency_contact_phone}
                      onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      placeholder="Contact phone"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Medical Clearance / PAR-Q Question Set */}
              <div className="space-y-4 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center border border-amber-500/30 font-black">2</span>
                    PAR-Q (Physical Activity Readiness Questionnaire)
                  </h3>
                </div>
                <p className="text-xs text-white/60">
                  Standard medical clearance questions for all fitness and coaching clients. If you answer YES to any item, your trainer will be alerted prior to your session.
                </p>

                <div className="space-y-3">
                  {PARQ_QUESTIONS.map((pq) => (
                    <div key={pq.key} className="p-3.5 rounded-xl border border-white/10 bg-white/5 space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-white/90">{pq.question}</p>
                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                          <input
                            type="radio"
                            name={pq.key}
                            value="no"
                            checked={responses[pq.key] === "no"}
                            onChange={() => handleChange(pq.key, "no")}
                            className="accent-blue-500"
                          />
                          No
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-amber-400 cursor-pointer">
                          <input
                            type="radio"
                            name={pq.key}
                            value="yes"
                            checked={responses[pq.key] === "yes"}
                            onChange={() => handleChange(pq.key, "yes")}
                            className="accent-amber-500"
                          />
                          Yes
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {hasParqYes && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <span>⚠️ Medical Alert Flagged</span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      You answered "Yes" to one or more PAR-Q questions. Please describe your medical condition or physician recommendations below. Your trainer will be notified to ensure safe training programming.
                    </p>
                    <textarea
                      rows={3}
                      required={hasParqYes}
                      value={responses.parq_details}
                      onChange={(e) => handleChange("parq_details", e.target.value)}
                      placeholder="Please elaborate on your 'Yes' answers above..."
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* 3. Health History & Medical Conditions */}
              <div className="space-y-4 border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center border border-blue-500/30 font-black">3</span>
                  Health History & Diagnosed Conditions
                </h3>
                <p className="text-xs text-white/60">Select any medical conditions you currently have or have been treated for:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HEALTH_CONDITIONS_OPTIONS.map((cond) => {
                    const checked = (responses.health_conditions || []).includes(cond);
                    return (
                      <label
                        key={cond}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                          checked
                            ? "bg-blue-500/20 border-blue-500/50 text-white"
                            : "bg-slate-900/60 border-white/10 text-white/70 hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCheckboxToggle(cond)}
                          className="accent-blue-500 rounded"
                        />
                        {cond}
                      </label>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-white/80">Additional Medical History / Past Surgeries</label>
                  <textarea
                    rows={2}
                    value={responses.health_history_details}
                    onChange={(e) => handleChange("health_history_details", e.target.value)}
                    placeholder="e.g. ACL surgery (2021), mild asthma controlled with inhaler..."
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4. Current Injuries & Medications */}
              <div className="space-y-4 border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center border border-blue-500/30 font-black">4</span>
                  Injuries, Limitations & Medications
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/80">Do you have any current injuries or joint pain? *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="has_injuries"
                          value="no"
                          checked={responses.has_injuries === "no"}
                          onChange={() => handleChange("has_injuries", "no")}
                        /> No
                      </label>
                      <label className="flex items-center gap-2 text-xs text-amber-400 font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="has_injuries"
                          value="yes"
                          checked={responses.has_injuries === "yes"}
                          onChange={() => handleChange("has_injuries", "yes")}
                        /> Yes
                      </label>
                    </div>
                    {responses.has_injuries === "yes" && (
                      <textarea
                        rows={2}
                        required
                        value={responses.injuries_details}
                        onChange={(e) => handleChange("injuries_details", e.target.value)}
                        placeholder="Describe injury, pain triggers, or joint limitations..."
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/80">Are you currently taking any prescription medications? *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="takes_medications"
                          value="no"
                          checked={responses.takes_medications === "no"}
                          onChange={() => handleChange("takes_medications", "no")}
                        /> No
                      </label>
                      <label className="flex items-center gap-2 text-xs text-amber-400 font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="takes_medications"
                          value="yes"
                          checked={responses.takes_medications === "yes"}
                          onChange={() => handleChange("takes_medications", "yes")}
                        /> Yes
                      </label>
                    </div>
                    {responses.takes_medications === "yes" && (
                      <textarea
                        rows={2}
                        required
                        value={responses.medications_details}
                        onChange={(e) => handleChange("medications_details", e.target.value)}
                        placeholder="Specify medications (especially blood pressure or heart prescriptions)..."
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Occupation & Lifestyle */}
              <div className="space-y-4 border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center border border-blue-500/30 font-black">5</span>
                  Occupation & Lifestyle
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Occupation *</label>
                    <input
                      type="text"
                      required
                      value={responses.occupation}
                      onChange={(e) => handleChange("occupation", e.target.value)}
                      placeholder="e.g. Software Engineer, Executive, Teacher"
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Daily Sedentary / Desk Hours *</label>
                    <select
                      value={responses.sedentary_hours_per_day}
                      onChange={(e) => handleChange("sedentary_hours_per_day", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="0-2 hours">0-2 hours</option>
                      <option value="3-5 hours">3-5 hours</option>
                      <option value="6-8 hours">6-8 hours</option>
                      <option value="9+ hours (Highly Desk-bound)">9+ hours (Highly Desk-bound)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Work Travel Frequency *</label>
                    <select
                      value={responses.travel_frequency}
                      onChange={(e) => handleChange("travel_frequency", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Never / Rarely">Never / Rarely</option>
                      <option value="Occasionally (1-2x/month)">Occasionally (1-2x/month)</option>
                      <option value="Frequently (Weekly)">Frequently (Weekly)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Daily Stress Level *</label>
                    <select
                      value={responses.stress_level}
                      onChange={(e) => handleChange("stress_level", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-white/80">Average Sleep Per Night *</label>
                    <select
                      value={responses.sleep_hours_per_night}
                      onChange={(e) => handleChange("sleep_hours_per_night", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="< 5 hours (Deficit)">Less than 5 hours (Deficit)</option>
                      <option value="5-6 hours">5-6 hours</option>
                      <option value="7-8 hours (Optimal)">7-8 hours (Optimal)</option>
                      <option value="9+ hours">9+ hours</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. Activity & Goals */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center border border-blue-500/30 font-black">6</span>
                  Current Activity Level & Primary Goals
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Current Exercise Frequency *</label>
                    <select
                      value={responses.exercise_frequency}
                      onChange={(e) => handleChange("exercise_frequency", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="0 days/week (Sedentary)">0 days/week (Sedentary)</option>
                      <option value="1-2 days/week">1-2 days/week</option>
                      <option value="3-4 days/week">3-4 days/week</option>
                      <option value="5+ days/week">5+ days/week</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Equipment Access *</label>
                    <input
                      type="text"
                      required
                      value={responses.equipment_access}
                      onChange={(e) => handleChange("equipment_access", e.target.value)}
                      placeholder="e.g. Commercial Gym, Home Dumbbells, Barbells"
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Primary Fitness Goal *</label>
                    <select
                      value={responses.primary_goal}
                      onChange={(e) => handleChange("primary_goal", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Fat Loss & Toning">Fat Loss & Toning</option>
                      <option value="Muscle Hypertrophy">Muscle Hypertrophy</option>
                      <option value="Strength & Power">Strength & Power</option>
                      <option value="Athletic Performance">Athletic Performance</option>
                      <option value="General Health & Posture">General Health & Posture</option>
                      <option value="Special Population Rehabilitation">Special Population Rehabilitation</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">Target Timeline *</label>
                    <select
                      value={responses.target_timeline}
                      onChange={(e) => handleChange("target_timeline", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="1-3 months">1-3 months (Short term)</option>
                      <option value="3-6 months">3-6 months (Medium term)</option>
                      <option value="6-12 months">6-12 months (Long term)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-white/80">Detailed Goal Description & Specific Expectations</label>
                    <textarea
                      rows={3}
                      value={responses.goal_details}
                      onChange={(e) => handleChange("goal_details", e.target.value)}
                      placeholder="Share what success looks like to you (e.g. lose 15 lbs, squat bodyweight, fix lower back tightness)..."
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-base font-bold shadow-lg"
                disabled={submitting}
              >
                {submitting ? "Submitting Assessment Responses..." : "Submit Completed Intake Questionnaire"}
              </Button>
            </form>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
