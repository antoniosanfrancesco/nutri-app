import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { dietService } from '../services/dietService';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ patientsCount: 0, dietsCount: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [patientsData, dietsData] = await Promise.all([
          patientService.getAll(),
          dietService.getAll(),
        ]);

        const patientsList = Array.isArray(patientsData) ? patientsData : [];
        const dietsList = Array.isArray(dietsData) ? dietsData : [];

        setStats({
          patientsCount: patientsList.length,
          dietsCount: dietsList.length,
        });

        // Prende gli ultimi 5 pazienti aggiunti
        setRecentPatients(patientsList.slice(-5).reverse());
      } catch (err) {
        console.error('Errore nel recupero dati dashboard:', err);
        setError('Impossibile caricare i dati della dashboard. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-vh-100">
      <Container fluid="lg" className="pb-5 pt-3">
        
        {/* Header di benvenuto */}
        <div className="mb-4">
          <h2 className="fw-bold" style={{ color: 'var(--border)' }}>
            Benvenuto{user?.nome ? `, Dott. ${user.nome} ${user.cognome}` : ''}
          </h2>
          <p className="text-muted">Ecco una panoramica della tua attività professionale.</p>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: 'var(--primary)' }} />
            <p className="text-muted mt-2">Caricamento dashboard in corso...</p>
          </div>
        ) : (
          <>
            {/* Cards delle Metriche e Azioni Rapide */}
            <Row className="g-4 mb-5">
              
              {/* Card Pazienti Totali */}
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <span className="text-muted small fw-semibold text-uppercase">Pazienti Totali</span>
                      <h1 className="fw-bold display-5 my-2" style={{ color: 'var(--primary)' }}>
                        {stats.patientsCount}
                      </h1>
                      <p className="text-muted small mb-0">Anagrafiche registrate in piattaforma</p>
                    </div>
                    <Button
                      as={Link}
                      to="/patients"
                      size="sm"
                      className="mt-4 fw-semibold rounded-pill border-0 text-white"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      Gestisci Pazienti →
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              {/* Card Diete Attive */}
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <span className="text-muted small fw-semibold text-uppercase">Diete Attive</span>
                      <h1 className="fw-bold display-5 my-2" style={{ color: 'var(--accent)' }}>
                        {stats.dietsCount}
                      </h1>
                      <p className="text-muted small mb-0">Piani nutrizionali elaborati</p>
                    </div>
                    <Button
                      as={Link}
                      to="/diets"
                      size="sm"
                      className="mt-4 fw-semibold rounded-pill border-0 text-white"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      Vedi tutte le diete →
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              {/* Card Azioni Rapide (Usa il verde principale o il colore border per coerenza) */}
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 text-white h-100" style={{ backgroundColor: 'var(--primary)' }}>
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <span className="text-white-50 small fw-semibold text-uppercase">Azioni Rapide</span>
                      <h4 className="text-white fw-bold my-2">Cosa vuoi fare?</h4>
                      <p className="text-white-50 small mb-0">Accedi velocemente alle funzioni più usate.</p>
                    </div>
                    <div className="d-grid gap-2 mt-4">
                      <Button
                        variant="light"
                        className="fw-semibold rounded-pill text-start px-3 text-dark border-0 shadow-sm"
                        onClick={() => navigate('/patients?action=new')}
                      >
                        + Nuovo Paziente
                      </Button>
                      <Button
                        variant="outline-light"
                        className="fw-semibold rounded-pill text-start px-3 text-white"
                        onClick={() => navigate('/diets?action=new')}
                      >
                        + Nuova Dieta
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

            </Row>

            {/* Tabella degli Ultimi Pazienti */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0" style={{ color: 'var(--border)' }}>Pazienti Aggiunti di Recente</h5>
                <Button 
                  as={Link} 
                  to="/patients" 
                  variant="link" 
                  className="text-decoration-none fw-semibold p-0"
                  style={{ color: 'var(--primary)' }}
                >
                  Vedi tutti
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                {recentPatients.length === 0 ? (
                  <div className="p-4 text-center text-muted">Nessun paziente registrato al momento.</div>
                ) : (
                  <Table responsive hover className="align-middle mb-0">
                    <thead className="bg-light text-muted small">
                      <tr>
                        <th className="ps-4">Nome & Cognome</th>
                        <th>Codice Fiscale</th>
                        <th>Email / Telefono</th>
                        <th className="text-end pe-4">Azione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPatients.map((patient) => (
                        <tr key={patient.id}>
                          <td className="ps-4 fw-bold" style={{ color: 'var(--border)' }}>
                            {patient.nome} {patient.cognome}
                          </td>
                          <td className="text-muted small">{patient.codiceFiscale || '-'}</td>
                          <td className="small text-muted">{patient.email || patient.telefono || '-'}</td>
                          <td className="text-end pe-4">
                            <Button
                              size="sm"
                              className="rounded-pill px-3 fw-semibold border-0"
                              style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
                              onClick={() => navigate(`/patients/${patient.id}`)}
                            >
                              Scheda
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
