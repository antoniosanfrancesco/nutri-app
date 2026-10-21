import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar'; 

export default function MainLayout() {
  const location = useLocation(); 

  return (
    <div className="app-layout">
      <Navbar /> 
      
      {/* Contenitore animato delle pagine */}
      <div key={location.pathname} className="page-transition">
        <Outlet />
      </div>
    </div>
  );
}
