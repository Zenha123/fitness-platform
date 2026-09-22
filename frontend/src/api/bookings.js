import API from "./axiosClient";

export const getBookingServices = async () => {
  const response = await API.get("/bookings/services/");
  return response.data;
};

export const getAvailableSlots = async (serviceId, dateStr, timezoneStr, trainerId = null) => {
  const params = { service_id: serviceId, date: dateStr, timezone: timezoneStr };
  if (trainerId) params.trainer_id = trainerId;
  const response = await API.get("/bookings/available-slots/", { params });
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await API.post("/bookings/create/", bookingData);
  return response.data;
};

export const getIntakeForm = async (token) => {
  const response = await API.get(`/bookings/intake/${token}/`);
  return response.data;
};

export const submitIntakeForm = async (token, responses) => {
  const response = await API.post(`/bookings/intake/${token}/`, { responses });
  return response.data;
};

// Trainer Availability API
export const getTrainerAvailability = async (serviceType = null) => {
  const params = {};
  if (serviceType) params.service_type = serviceType;
  const response = await API.get("/bookings/trainer/availability/", { params });
  return response.data.results || response.data;
};

export const createTrainerAvailability = async (data) => {
  const response = await API.post("/bookings/trainer/availability/", data);
  return response.data;
};

export const deleteTrainerAvailability = async (id) => {
  const response = await API.delete(`/bookings/trainer/availability/${id}/`);
  return response.data;
};

// Trainer Blackouts API
export const getTrainerBlackouts = async () => {
  const response = await API.get("/bookings/trainer/blackouts/");
  return response.data.results || response.data;
};

export const createTrainerBlackout = async (data) => {
  const response = await API.post("/bookings/trainer/blackouts/", data);
  return response.data;
};

export const deleteTrainerBlackout = async (id) => {
  const response = await API.delete(`/bookings/trainer/blackouts/${id}/`);
  return response.data;
};

// Trainer Manage Bookings API
export const getTrainerBookings = async () => {
  const response = await API.get("/bookings/trainer/manage-bookings/");
  return response.data.results || response.data;
};

export const getClientBookings = async () => {
  const response = await API.get("/bookings/client/my-bookings/");
  return response.data.results || response.data;
};

// Assessment Report API (§5.7)
export const saveAssessmentReport = async (reportData) => {
  const response = await API.post("/bookings/reports/save/", reportData);
  return response.data;
};

export const releaseAssessmentReport = async (reportId) => {
  const response = await API.post(`/bookings/reports/${reportId}/release/`);
  return response.data;
};

export const getAssessmentReportPdfUrl = (reportId, token = null) => {
  const baseURL = API.defaults.baseURL || "http://localhost:8000/api";
  let url = `${baseURL}/bookings/reports/${reportId}/pdf/`;
  if (token) url += `?token=${token}`;
  return url;
};

/**
 * Securely downloads/opens the assessment report PDF using the authenticated
 * axios client (sends JWT in Authorization header). Returns a temporary blob URL.
 */
export const downloadAssessmentReportPdf = async (reportId) => {
  const response = await API.get(`/bookings/reports/${reportId}/pdf/`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
};
