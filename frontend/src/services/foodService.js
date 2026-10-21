import api from '../api/axiosInstance';

export const foodService = {
  getAll: async () => {
    const response = await api.get('/foods');
    return response.data;
  },

	create: async (foodData) => {
		const response = await api.post('/foods', foodData)
		return response.data;
	}, 

	searchExternal: async (query) => {
		const response = await api.get('/foods/external-search', {
      params: { query }
    });
		return response.data;
	}
};

export default foodService;