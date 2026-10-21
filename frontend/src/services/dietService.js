import api from '../api/axiosInstance';

export const dietService = {
  getAll: async () => {
    const response = await api.get('/diets');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/diets/${id}`);
    return response.data;
  },

  create: async (dietData) => {
    const response = await api.post('/diets', dietData);
    return response.data;
  },

  update: async (id, dietData) => {
    const response = await api.put(`/diets/${id}`, dietData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/diets/${id}`);
    return response.data;
  },
};

export default dietService;