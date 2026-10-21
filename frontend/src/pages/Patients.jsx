import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Row,
  Col,
  InputGroup,
  Card,
} from 'react-bootstrap';
import { patientService } from '../services/patientService';

const initialFormState = {
  nome: '',
  cognome: '',
  codiceFiscale: '',
  email: '',
  telefono: '',
  dataNascita: '',
  sesso: 'M',
  peso: '',
  altezza: '',
};

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stato Modale Form (Nuovo / Modifica)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // Funzione per ricaricare i pazienti dopo azioni utente (es. salva / elimina)
  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll();
      setPatients(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Errore durante il caricamento dei pazienti:', err);
      setError('Impossibile caricare la lista pazienti.');
    } finally {
      setLoading(false);
    }
  };

  // Caricamento iniziale al montaggio del componente
  useEffect(() => {
    let isMounted = true;

    patientService.getAll()
      .then((data) => {
        if (isMounted) {
          setPatients(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Errore durante il caricamento dei pazienti:', err);
          setError('Impossibile caricare la lista pazienti.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Gestione Input Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Apertura Modale in modalità Creazione
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  // Apertura Modale in modalità Modifica
  const handleOpenEdit = (patient) => {
    setEditingId(patient.id);
    setFormData({
      nome: patient.nome || '',
      cognome: patient.cognome || '',
      codiceFiscale: patient.codiceFiscale || '',
      email: patient.email || '',
      telefono: patient.telefono || '',
      dataNascita: patient.dataNascita || '',
      sesso: patient.sesso || 'M',
      peso: patient.peso || '',
      altezza: patient.altezza || '',
    });
    setShowModal(true);
  };

  // Salvataggio (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await patientService.update(editingId, formData);
      } else {
        await patientService.create(formData);
      }
      setShowModal(false);
      setLoading(true);
      await loadPatients();
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
      setError('Errore durante il salvataggio dei dati del paziente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminazione
  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo paziente?')) {
      try {
        await patientService.delete(id);
        setPatients(patients.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Errore durante l\'eliminazione:', err);
        setError('Impossibile eliminare il paziente selezionato.');
      }
    }
  };

  // Filtro ricerca
  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.nome?.toLowerCase().includes(term) ||
      p.cognome?.toLowerCase().includes(term) ||
      p.codiceFiscale?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-vh-100">
      <Container fluid="lg" className="pb-5 pt-3">
        
        {/* Header con sfondo --bg e bordi arrotondati rounded-5 */}
        <Row 
            className="rounded-5 p-3 mb-4 align-items-md-center justify-content-between flex-column flex-md-row gap-3" 
            style={{ backgroundColor: 'var(--bg)' }}
        >
          <div className="ms-3">
            <h2 className="fw-bold mb-1" style={{ color: 'var(--border)' }}>Gestione Pazienti</h2>
            <p className="text-muted small mb-0">Visualizza, aggiungi e modifica le schede personali</p>
          </div>
          <Button 
            className="fw-semibold rounded-pill px-4 border-0 text-white"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={handleOpenCreate}
          >
            + Nuovo Paziente
          </Button>
        </Row>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {/* Barra di Ricerca */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
          <Card.Body className="p-3">
            <InputGroup>
              <InputGroup.Text className="bg-light border-0">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Cerca per nome, cognome o codice fiscale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-light px-2"
              />
            </InputGroup>
          </Card.Body>
        </Card>

        {/* Tabella Pazienti */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--primary)' }} />
                <p className="text-muted mt-2 mb-0">Caricamento pazienti...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-5 text-center text-muted">
                {searchTerm ? 'Nessun paziente corrisponde ai criteri di ricerca.' : 'Nessun paziente registrato al momento.'}
              </div>
            ) : (
              <Table responsive hover className="align-middle mb-0">
                <thead className="bg-light text-muted small">
                  <tr>
                    <th className="ps-4">Paziente</th>
                    <th>Codice Fiscale</th>
                    <th>Contatti</th>
                    <th>Dati Fisici</th>
                    <th className="text-end pe-4">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td 
                        className="ps-4 fw-bold" 
                        style={{ cursor: 'pointer', color: 'var(--border)' }}
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        {patient.nome} {patient.cognome}
                      </td>
                      <td className="text-muted small">{patient.codiceFiscale || '-'}</td>
                      <td className="small text-muted">
                        {patient.email && <div>{patient.email}</div>}
                        {patient.telefono && <div>{patient.telefono}</div>}
                        {!patient.email && !patient.telefono && '-'}
                      </td>
                      <td className="small text-muted">
                        {patient.peso ? `${patient.peso} kg` : '-'} / {patient.altezza ? `${patient.altezza} cm` : '-'}
                      </td>
                      <td className="text-end pe-4">
                        {/* Pulsante Scheda Paziente */}
                        <Button
                          size="sm"
                          className="rounded-pill me-2 px-3 fw-semibold border-0 text-white"
                          style={{ backgroundColor: 'var(--primary)' }}
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                        	Scheda
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-pill me-2 px-3 fw-semibold"
                          onClick={() => handleOpenEdit(patient)}
                        >
                          Modifica
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-pill px-3"
                          onClick={() => handleDelete(patient.id)}
                        >
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modale Form Creazione/Modifica */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: 'var(--border)' }}>
            {editingId ? 'Modifica Paziente' : 'Nuovo Paziente'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Nome *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Cognome *</Form.Label>
                  <Form.Control
                    type="text"
                    name="cognome"
                    value={formData.cognome}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Codice Fiscale</Form.Label>
                  <Form.Control
                    type="text"
                    name="codiceFiscale"
                    value={formData.codiceFiscale}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Data di Nascita</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataNascita"
                    value={formData.dataNascita}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Telefono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Sesso</Form.Label>
                  <Form.Select name="sesso" value={formData.sesso} onChange={handleChange}>
                    <option value="M">Maschio</option>
                    <option value="F">Femmina</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Peso (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Altezza (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="altezza"
                    value={formData.altezza}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-pill px-3" onClick={() => setShowModal(false)} disabled={submitting}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              className="rounded-pill px-4 border-0 text-white fw-semibold" 
              style={{ backgroundColor: 'var(--primary)' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                  Salvataggio...
                </>
              ) : (
                'Salva Paziente'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
