import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determina la rotta di destinazione post-login (di default /dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Credenziali non valide o problemi di connessione con il server.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center py-5">
      <Container className="d-flex justify-content-center align-items-center">
        <div style={{ maxWidth: '420px', width: '100%' }}>
          
          <Card className="shadow-lg border-0 rounded-5 bg-white overflow-hidden">
            <Card.Body className="p-4 p-sm-5">
              
              {/* Logo / Header */}
              <div className="text-center mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 p-3"
                  style={{ backgroundColor: 'var(--accent-bg)', width: '64px', height: '64px' }}
                >
                  <span className="fs-2">🥗</span>
                </div>
                <h2 className="fw-bold mb-1" style={{ color: 'var(--border)' }}>
                  NutriApp
                </h2>
                <p className="text-muted small mb-0">
                  Accedi al tuo pannello nutrizionista
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="py-2 small text-center border-0 shadow-sm mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="fw-semibold small" style={{ color: 'var(--border)' }}>
                    Email professionale
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="nutrizionista@nutriapp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="fw-semibold small" style={{ color: 'var(--border)' }}>
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="py-2"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 py-2.5 fw-semibold rounded-pill border-0 text-white shadow-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Accesso in corso...
                    </>
                  ) : (
                    'Accedi'
                  )}
                </Button>
              </Form>

              {/* Link Registrazione */}
              <div className="text-center mt-4 pt-2 border-top">
                <p className="small text-muted mb-0">
                  Non hai ancora un account?{' '}
                  <Link 
                    to="/register" 
                    className="fw-semibold text-decoration-none"
                    style={{ color: 'var(--primary)' }}
                  >
                    Registrati
                  </Link>
                </p>
              </div>

            </Card.Body>
          </Card>

        </div>
      </Container>
    </div>
  );
};

export default Login;
