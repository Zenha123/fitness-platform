import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getBookingServices, getAvailableSlots, createBooking } from "../api/bookings";
import Navbar from "../components/Navbar";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";

/** YYYY-MM-DD in the browser's local calendar (avoids UTC date shift from toISOString). */
function toLocalDateISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function PublicBookingPage() {
  const { serviceType } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateISO());
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const commonTimezones = [
    "UTC",
    "Asia/Kolkata",
    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "Europe/London",
    "Europe/Paris",
    "Asia/Dubai",
    "Australia/Sydney",
  ];

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await getBookingServices();
        const list = Array.isArray(data) ? data : (data?.results || []);
        setServices(list);
        if (list.length > 0) {
          if (serviceType) {
            const matched = list.find((s) => s.service_type === serviceType);
            setSelectedService(matched || list[0]);
          } else {
            setSelectedService(list[0]);
          }
        }
      } catch (err) {
        setError("Failed to load booking services. Please refresh.");
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, [serviceType]);

  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    async function fetchSlots() {
      setLoadingSlots(true);
      setError("");
      try {
        const res = await getAvailableSlots(selectedService.id, selectedDate, timezone);
        setSlots(res.slots || []);
        setSelectedSlot(null);
      } catch (err) {
        setError("Failed to fetch available time slots.");
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedService, selectedDate, timezone]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        service_id: selectedService.id,
        start_time: selectedSlot.start_time,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_notes: clientNotes,
        client_timezone: timezone,
      };
      const res = await createBooking(payload);
      navigate(`/booking/success/${res.id}`, { state: { booking: res } });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to complete booking. Slot may have been taken.";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white">
      <Navbar />

      <PageContainer variant="narrow" className="space-y-6 py-6 sm:space-y-8 sm:py-8">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] p-5 text-center text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[var(--color-signal)] backdrop-blur-md">
              Haqq Athlete Coaching & Consultation
            </span>
            <h1 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">
              Book Your 1-on-1 Session
            </h1>
            <p className="mx-auto max-w-lg text-sm font-medium text-white/70 sm:text-base">
              Select your service, choose your local time slot, and lock in your appointment instantly.
            </p>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loadingServices ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Step 1: Service & Slot Selector */}
            <div className="space-y-6 rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] p-5 shadow-lg sm:p-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-black">1</span>
                Select Service & Time Slot
              </h2>

              {/* Service Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/15 text-white shadow-lg"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <div className="font-bold text-sm text-white">{srv.title}</div>
                      <div className="text-xs text-blue-400 font-semibold mt-1">
                        ⏱️ {srv.duration_minutes} Minutes
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedService && (
                <p className="text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/5">
                  {selectedService.description}
                </p>
              )}

              {/* Date & Timezone Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Select Date</label>
                  <input
                    type="date"
                    min={toLocalDateISO()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Your Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {!commonTimezones.includes(timezone) && <option value={timezone}>{timezone}</option>}
                    {commonTimezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slots Grid */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Available Slots ({timezone})</h3>
                {loadingSlots ? (
                  <div className="py-6 text-center text-xs text-white/50"><Spinner /></div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-6 text-xs text-white/50 bg-white/5 rounded-xl border border-white/5">
                    No available slots for {selectedDate}. Please select another date.
                  </div>
                ) : (
                  <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                    {slots.map((s, idx) => {
                      const isSelected = selectedSlot?.start_time === s.start_time;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlot(s)}
                          className={`p-2.5 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-blue-500 text-white border-2 border-blue-400 shadow-md"
                              : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {s.display_start}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Contact Form */}
            <div className="space-y-6 rounded-[var(--radius-2xl)] border border-white/10 bg-[var(--color-ink)] p-5 shadow-lg sm:p-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-black">2</span>
                Enter Your Details
              </h2>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Additional Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Anything specific you'd like to discuss during the call?"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-y"
                  />
                </div>

                {selectedSlot && (
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-1">
                    <div className="font-bold text-blue-400">Selected Reservation:</div>
                    <div className="text-white font-semibold">{selectedSlot.display_date}</div>
                    <div className="text-white/70">{selectedSlot.formatted_local}</div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-base font-bold shadow-lg"
                  disabled={submitting || !selectedSlot}
                >
                  {submitting ? "Reserving Slot..." : "Confirm & Book Session"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
