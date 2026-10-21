import api from '../api/axiosInstance';

export const authService = {
  // Login dell'utente e salvataggio del token
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  // Rimozione credenziali locali
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Recupera l'utente salvato in locale
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};