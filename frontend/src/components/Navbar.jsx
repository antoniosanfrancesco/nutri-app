import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AppNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Navbar expand="lg" className="navbar-custom mb-4 sticky-top">
      <Container fluid="lg">
        <Navbar.Brand as={NavLink} to="/dashboard" className="text-white fw-bold fs-4">
          NutriApp
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="main-navbar" />
        
        <Navbar.Collapse id="main-navbar">
          {isAuthenticated && (
            <Nav className="me-auto ms-lg-3 custom-nav-links fw-bold">
              <Nav.Link as={NavLink} to="/dashboard">
                Dashboard
              </Nav.Link>
              <Nav.Link as={NavLink} to="/patients">
                Pazienti
              </Nav.Link>
              <Nav.Link as={NavLink} to="/diets">
                Diete
              </Nav.Link>
            </Nav>
          )}
          
          <Nav className="ms-auto align-items-lg-center gap-3 mt-2 mt-lg-0">
            {isAuthenticated && user && (
              <>
                <span className="text-white fw-semibold">
                Benvenuto, <strong className="text-white">{user.nome ? `${user.nome} ${user.cognome}` : user.email}</strong>
                </span>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="btn-custom-danger fw-semibold px-3 rounded-pill d-flex align-items-center gap-1"
                >
                  <i className="bi bi-box-arrow-right"></i> Esci
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;