import api from './axiosClient';

export const exercisesApi = {
  // Get all exercises for the logged-in trainer (with optional category filter and search)
  getExercises: async (params = {}) => {
    const response = await api.get('/exercises/', { params });
    return response.data.results || response.data;
  },

  // Create a new exercise
  createExercise: async (exerciseData) => {
    const response = await api.post('/exercises/', exerciseData);
    return response.data;
  },

  // Update an exercise
  updateExercise: async (exerciseId, updateData) => {
    const response = await api.patch(`/exercises/${exerciseId}/`, updateData);
    return response.data;
  },

  // Delete an exercise
  deleteExercise: async (exerciseId) => {
    const response = await api.delete(`/exercises/${exerciseId}/`);
    return response.data;
  }
};
