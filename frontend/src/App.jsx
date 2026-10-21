import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import DietsList from './pages/DietsList';
import DietEditorPage from './pages/DietEditorPage';
import PatientDetailPage from './pages/PatientDetails';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotte protette (richiedono autenticazione) */}
          <Route element={<ProtectedRoute />}>
						<Route element={<MainLayout />}> // contenitore per l'animazione
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/patients" element={<Patients />} />
							<Route path="/diets" element={<DietsList />} />
							
							<Route path="/diets/new" element={<DietEditorPage />} />
							<Route path="/diets/edit/:id" element={<DietEditorPage />} />
							<Route path="/patients" element={<Patients />} />
							<Route path="/patients/:id" element={<PatientDetailPage />} />
							</Route>
          </Route>

          {/* Redirect di default */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;