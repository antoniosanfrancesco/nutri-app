import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Nav, Button, Spinner, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import PatientMeasurements from '../components/PatientMeasurements';
import { patientService } from '../services/patientService';
import { dietService } from '../services/dietService';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('measurements'); // 'measurements' | 'diets' | 'info'

  useEffect(() => {
    let isMounted = true;

    // Carichiamo in parallelo i dati del paziente e tutte le diete per filtrare quelle sue
    Promise.all([
      patientService.getById(id),
      dietService.getAll()
    ])
      .then(([patientData, dietsData]) => {
        if (isMounted) {
          setPatient(patientData);
          
          const allDiets = Array.isArray(dietsData) ? dietsData : [];
          // Filtriamo le diete appartenenti a questo paziente (supportando sia patientId numerico che eventuale match testuale)
          const patientDiets = allDiets.filter(
            (d) => Number(d.patientId) === Number(id) || 
                   (d.patientNome === patientData.nome && d.patientCognome === patientData.cognome)
          );
          setDiets(patientDiets);

          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Errore durante il recupero dei dati:', err);
          setError('Impossibile caricare i dati del paziente.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-vh-100">
      <Container fluid="lg" className="pb-5 pt-3">
        
        {/* Pulsante Indietro */}
        <Button 
          variant="outline-secondary" 
          size="sm" 
          className="rounded-pill mb-3 px-3 fw-semibold" 
          onClick={() => navigate('/patients')}
        >
          ← Torna alla lista pazienti
        </Button>

        {error && <Alert variant="danger" dismissible>{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: 'var(--primary)' }} />
            <p className="text-muted mt-2">Caricamento scheda paziente...</p>
          </div>
        ) : patient ? (
          <>
            {/* Header Profilo Paziente con Azioni Rapide */}
            <Row 
              className="rounded-5 p-4 mb-4 align-items-center justify-content-between g-3"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <Col md={7} className="ms-md-2">
                <h2 className="fw-bold mb-1" style={{ color: 'var(--border)' }}>
                  {patient.nome} {patient.cognome}
                </h2>
                <p className="text-muted small mb-0">
                  CF: {patient.codiceFiscale || 'N/D'} | Nato/a il: {patient.dataNascita || 'N/D'}
                </p>
              </Col>
              
              <Col md={4} className="text-md-end d-flex flex-wrap gap-2 justify-content-md-end align-items-center">
                <span 
                  className="badge fs-6 fw-semibold px-3 py-2 rounded-pill border-0 text-white shadow-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {patient.sesso === 'M' ? 'Maschio' : 'Femmina'}
                </span>
                
                {/* 🟢 Pulsante rapido per creare una dieta associata a questo paziente */}
                <Button
                  size="sm"
                  className="rounded-pill px-3 fw-semibold border-0 text-white shadow-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                  onClick={() => navigate('/diets?action=new')}
                >
                  + Nuova Dieta
                </Button>
              </Col>
            </Row>

            {/* Navigazione Tab Avanzata */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
              <Card.Header className="bg-white border-0 pt-3 px-4">
                <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="gap-2">
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="measurements" 
                      className="fw-semibold rounded-pill px-3 py-2"
                      style={{
                        backgroundColor: activeTab === 'measurements' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'measurements' ? '#ffffff' : 'var(--border)'
                      }}
                    >
                    	Misurazioni
                    </Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link 
                      eventKey="diets" 
                      className="fw-semibold rounded-pill px-3 py-2"
                      style={{
                        backgroundColor: activeTab === 'diets' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'diets' ? '#ffffff' : 'var(--border)'
                      }}
                    >
                      Piani Nutrizionali ({diets.length})
                    </Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link 
                      eventKey="info" 
                      className="fw-semibold rounded-pill px-3 py-2"
                      style={{
                        backgroundColor: activeTab === 'info' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'info' ? '#ffffff' : 'var(--border)'
                      }}
                    >
                      Anagrafica & Contatti
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body className="p-4">
                {activeTab === 'measurements' && (
                  <PatientMeasurements patientId={id} />
                )}

                {activeTab === 'diets' && (
                  <div>
                    {diets.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <p className="mb-2">Nessun piano nutrizionale associato a questo paziente.</p>
                        <Button 
                          size="sm" 
                          className="rounded-pill px-3 fw-semibold border-0 text-white"
                          style={{ backgroundColor: 'var(--primary)' }}
                          onClick={() => navigate('/diets?action=new')}
                        >
                          Crea il primo piano
                        </Button>
                      </div>
                    ) : (
                      <Table responsive hover className="align-middle mb-0">
                        <thead className="bg-light text-muted small">
                          <tr>
                            <th className="ps-3">Titolo Piano</th>
                            <th>Target Calorico</th>
                            <th>Macronutrienti (P / C / F)</th>
                            <th className="text-end pe-3">Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diets.map((diet) => (
                            <tr key={diet.id}>
                              <td className="ps-3 fw-bold" style={{ color: 'var(--border)' }}>
                                {diet.titolo}
                                {diet.note && <div className="text-muted small fw-normal">{diet.note}</div>}
                              </td>
                              <td>
                                <Badge className="px-3 py-2 rounded-pill border-0 text-white" style={{ backgroundColor: 'var(--primary)' }}>
                                  {diet.calorieTarget ?? 0} kcal
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Badge bg="danger" className="fw-normal">Prot: {diet.proteineTarget ?? 0}g</Badge>
                                  <Badge bg="warning" text="dark" className="fw-normal">Carb: {diet.carboidratiTarget ?? 0}g</Badge>
                                  <Badge bg="info" className="fw-normal">Gras: {diet.grassiTarget ?? 0}g</Badge>
                                </div>
                              </td>
                              <td className="text-end pe-3">
                                <Button
                                  size="sm"
                                  className="rounded-pill px-3 fw-semibold border-0 text-white"
                                  style={{ backgroundColor: 'var(--primary)' }}
                                  onClick={() => navigate(`/diets/edit/${diet.id}`)}
                                >
                                  Personalizzata
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </div>
                )}

                {activeTab === 'info' && (
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="p-3 bg-light rounded-4 border-0">
                        <small className="text-muted d-block mb-1">Email</small>
                        <strong className="text-dark">{patient.email || 'N/D'}</strong>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-3 bg-light rounded-4 border-0">
                        <small className="text-muted d-block mb-1">Telefono</small>
                        <strong className="text-dark">{patient.telefono || 'N/D'}</strong>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-3 bg-light rounded-4 border-0">
                        <small className="text-muted d-block mb-1">Peso Iniziale</small>
                        <strong className="text-dark">{patient.peso ? `${patient.peso} kg` : 'N/D'}</strong>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-3 bg-light rounded-4 border-0">
                        <small className="text-muted d-block mb-1">Altezza Iniziale</small>
                        <strong className="text-dark">{patient.altezza ? `${patient.altezza} cm` : 'N/D'}</strong>
                      </div>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </>
        ) : null}
      </Container>
    </div>
  );
}
