import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getIntakeForm, submitIntakeForm } from "../api/bookings";
import Navbar from "../components/Navbar";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";

export default function IntakeFormPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchForm() {
      try {
        const data = await getIntakeForm(token);
        setFormData(data);
        if (data.already_submitted) {
          setSubmitted(true);
          setResponses(data.submission?.responses || {});
        }
      } catch (err) {
        setError("Invalid or expired intake form link.");
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [token]);

  const handleChange = (questionKey, value) => {
    setResponses((prev) => ({ ...prev, [questionKey]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

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

  const isCoaching = formData?.form_type === "coaching_intake";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white">
      <Navbar />

      <PageContainer variant="narrow" className="py-8">
        <div className="rounded-[var(--radius-2xl)] bg-[var(--color-ink)] border border-white/10 p-6 sm:p-10 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-4 space-y-1">
            <h1 className="text-2xl font-black text-white">Pre-Session Intake Questionnaire</h1>
            <p className="text-xs text-white/60">
              Client: <span className="text-white font-bold">{formData?.client_name}</span> ({formData?.client_email}) | Service: <span className="text-blue-400 font-bold">{formData?.service_title}</span>
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-white">Intake Questionnaire Submitted!</h2>
              <p className="text-sm text-white/70 max-w-md mx-auto font-medium">
                Thank you for completing your pre-session details. Your trainer will review your responses prior to your call.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="danger">{error}</Alert>}

              {isCoaching ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">
                      1. What is your primary fitness goal? *
                    </label>
                    <select
                      required
                      value={responses.primary_goal || ""}
                      onChange={(e) => handleChange("primary_goal", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Primary Goal</option>
                      <option value="Fat Loss & Toning">Fat Loss & Toning</option>
                      <option value="Muscle Building / Hypertrophy">Muscle Building / Hypertrophy</option>
                      <option value="Strength & Power">Strength & Power</option>
                      <option value="Athletic Performance">Athletic Performance</option>
                      <option value="General Health & Mobility">General Health & Mobility</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">
                      2. What is your current training experience level? *
                    </label>
                    <select
                      required
                      value={responses.experience_level || ""}
                      onChange={(e) => handleChange("experience_level", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Experience</option>
                      <option value="Beginner (0-6 months)">Beginner (0-6 months)</option>
                      <option value="Intermediate (6 months - 2 years)">Intermediate (6 months - 2 years)</option>
                      <option value="Advanced (2+ years consistent)">Advanced (2+ years consistent)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">
                      3. What workout equipment do you have access to? *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commercial Gym, Home Dumbbells, Barbells, Bodyweight"
                      value={responses.equipment || ""}
                      onChange={(e) => handleChange("equipment", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">
                      4. Do you have any medical conditions, past surgeries, or active injuries?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Lower back stiffness, knee pain when squatting, none"
                      value={responses.medical_history || ""}
                      onChange={(e) => handleChange("medical_history", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">
                      1. What is the single biggest challenge holding you back in fitness? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Lack of consistency, plateauing, bad nutrition habits"
                      value={responses.biggest_challenge || ""}
                      onChange={(e) => handleChange("biggest_challenge", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/80">
                      2. Have you worked with a personal trainer or online coach before? *
                    </label>
                    <select
                      required
                      value={responses.previous_coaching || ""}
                      onChange={(e) => handleChange("previous_coaching", e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Option</option>
                      <option value="Yes - In Person">Yes - In Person</option>
                      <option value="Yes - Online">Yes - Online</option>
                      <option value="No - Never">No - Never</option>
                    </select>
                  </div>
                </>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-base font-bold shadow-lg"
                disabled={submitting}
              >
                {submitting ? "Submitting Answers..." : "Submit Intake Responses"}
              </Button>
            </form>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
