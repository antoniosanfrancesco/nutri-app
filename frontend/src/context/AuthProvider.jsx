import { useState } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  // Inizializzazione pigra: viene eseguita UNA SOLA volta all'avvio prima del primo render.
  // Risolve l'errore di setState dentro useEffect ed evita il re-render a cascata.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Errore nel recupero utente salvato:", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    return null;
  });

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.token || response.data.jwt;
    const userData = response.data.user || { email: response.data.email || email };

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};