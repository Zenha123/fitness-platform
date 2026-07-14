import api from './axiosClient';

export const workoutsApi = {
  // --- Workout Plans ---
  getPlans: async (params = {}) => {
    // params can include { client: id, month: '2026-07' }
    const response = await api.get('/workouts/plans/', { params });
    return response.data.results || response.data;
  },
  
  getPlan: async (id) => {
    const response = await api.get(`/workouts/plans/${id}/`);
    return response.data;
  },
  
  createPlan: async (data) => {
    const response = await api.post('/workouts/plans/', data);
    return response.data;
  },
  
  updatePlan: async (id, data) => {
    const response = await api.put(`/workouts/plans/${id}/`, data);
    return response.data;
  },
  
  deletePlan: async (id) => {
    const response = await api.delete(`/workouts/plans/${id}/`);
    return response.data;
  },

  // --- Workout Templates ---
  getTemplates: async () => {
    const response = await api.get('/workouts/templates/');
    return response.data.results || response.data;
  },

  getTemplate: async (id) => {
    const response = await api.get(`/workouts/templates/${id}/`);
    return response.data;
  },

  createTemplate: async (data) => {
    const response = await api.post('/workouts/templates/', data);
    return response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await api.put(`/workouts/templates/${id}/`, data);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/workouts/templates/${id}/`);
    return response.data;
  },

  // --- Workout Logs ---
  getLogs: async (params = {}) => {
    const response = await api.get('/workouts/logs/', { params });
    return response.data.results || response.data;
  },

  getLog: async (id) => {
    const response = await api.get(`/workouts/logs/${id}/`);
    return response.data;
  },

  createLog: async (data) => {
    const response = await api.post('/workouts/logs/', data);
    return response.data;
  },

  updateLog: async (id, data) => {
    const response = await api.put(`/workouts/logs/${id}/`, data);
    return response.data;
  },

  deleteLog: async (id) => {
    const response = await api.delete(`/workouts/logs/${id}/`);
    return response.data;
  }
};
