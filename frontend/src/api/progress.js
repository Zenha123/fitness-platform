import api from './axiosClient';

export const progressApi = {
  // --- Weight & Photo Journey ---
  getWeightEntries: async (params = {}) => {
    // params can include { client: id }
    const response = await api.get('/progress/weights/', { params });
    return response.data.results || response.data;
  },

  createWeightEntry: async (formData) => {
    // formData should be a FormData object to handle file upload
    const response = await api.post('/progress/weights/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateWeightEntry: async (id, formData) => {
    const response = await api.patch(`/progress/weights/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteWeightEntry: async (id) => {
    const response = await api.delete(`/progress/weights/${id}/`);
    return response.data;
  },

  // --- Strength Tracking ---
  getStrengthExercises: async (params = {}) => {
    // params can include { client: id }
    const response = await api.get('/progress/strength/exercises/', { params });
    return response.data;
  },

  getStrengthData: async (params = {}) => {
    // params should include { exercise: id, client: id }
    const response = await api.get('/progress/strength/', { params });
    return response.data;
  },

  // --- Trainer Review Notes ---
  getReviews: async (params = {}) => {
    // params can include { client: id }
    const response = await api.get('/reviews/', { params });
    return response.data.results || response.data;
  },

  createReview: async (reviewData) => {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
  },

  updateReview: async (id, reviewData) => {
    const response = await api.patch(`/reviews/${id}/`, reviewData);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}/`);
    return response.data;
  },

  // --- Preferences / Profile ---
  updatePreferences: async (preferenceData) => {
    // preferenceData can include { weight_unit: 'kg' | 'lb' }
    const response = await api.patch('/auth/profile/', preferenceData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  }
};
