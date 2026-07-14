import api from './axiosClient';

export const clientsApi = {
  // Get all clients for the logged-in trainer
  getClients: async () => {
    const response = await api.get('/clients/');
    return response.data.results || response.data;
  },

  // Create a new client and link to trainer
  createClient: async (clientData) => {
    const response = await api.post('/clients/', clientData);
    return response.data;
  },

  // Get a single client's details
  getClient: async (clientId) => {
    const response = await api.get(`/clients/${clientId}/`);
    return response.data;
  },

  // Update client details
  updateClient: async (clientId, updateData) => {
    const response = await api.patch(`/clients/${clientId}/`, updateData);
    return response.data;
  },

  // Deactivate a client
  deactivateClient: async (clientId) => {
    const response = await api.patch(`/clients/${clientId}/`, { is_active: false });
    return response.data;
  }
};
