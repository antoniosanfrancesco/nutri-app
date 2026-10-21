import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validazione client-side della corrispondenza password
    if (formData.password !== formData.confermaPassword) {
      return setError('Le password inserite non coincidono.');
    }

    if (formData.password.length < 6) {
      return setError('La password deve contenere almeno 6 caratteri.');
    }

    setSubmitting(true);

    try {
      // Crea una copia e rimuove 'confermaPassword' senza creare variabili inutilizzate
      const payload = { ...formData };
      delete payload.confermaPassword;

      await register(payload);

      setSuccess(true);

      // Reindirizza alla pagina di login dopo 2 secondi
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Errore durante la registrazione. Verificare i dati o riprovare più tardi.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-4">
      <Card style={{ maxWidth: '500px', width: '100%' }} className="shadow-sm border-0 p-3">
        <Card.Body>
          <div className="text-center mb-4">
            <h3 className="fw-bold">Crea un Account</h3>
            <p className="text-muted small">Registrati per gestire le schede dei tuoi pazienti</p>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && (
            <Alert variant="success">
              Registrazione avvenuta con successo! Reindirizzamento al login in corso...
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="registerNome">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    placeholder="Mario"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    disabled={submitting || success}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="registerCognome">
                  <Form.Label>Cognome</Form.Label>
                  <Form.Control
                    type="text"
                    name="cognome"
                    placeholder="Rossi"
                    value={formData.cognome}
                    onChange={handleChange}
                    required
                    disabled={submitting || success}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="nome@esempio.it"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={submitting || success}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={submitting || success}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="registerConfermaPassword">
              <Form.Label>Conferma Password</Form.Label>
              <Form.Control
                type="password"
                name="confermaPassword"
                placeholder="••••••••"
                value={formData.confermaPassword}
                onChange={handleChange}
                required
                disabled={submitting || success}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3"
              disabled={submitting || success}
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
                  Registrazione in corso...
                </>
              ) : (
                'Registrati'
              )}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small className="text-muted">
              Hai già un account?{' '}
              <Link to="/login" className="text-decoration-none">
                Accedi
              </Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}