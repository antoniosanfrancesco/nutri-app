// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // Se l'utente non è autenticato, reindirizza al Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se autenticato, mostra i componenti figli (Outlet)
  return <Outlet />;
}