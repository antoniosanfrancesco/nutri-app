import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
  Badge,
  Row,
  Col
} from 'react-bootstrap';
import dietService from '../services/dietService';
import { patientService } from '../services/patientService';
window.dietService = dietService;

const DietsList = () => {
  const [diets, setDiets] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedDietId, setSelectedDietId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    titolo: '',
    patientId: '',
    calorieTarget: '2000',
    proteineTarget: '150',
    carboidratiTarget: '200',
    grassiTarget: '65',
    note: '',
  });

  const handleOpenModal = useCallback((diet = null) => {
    setFormError('');
    if (diet) {
      setSelectedDietId(diet.id);

      let pId = diet.patientId;
      if (!pId && diet.patientNome) {
        const match = patients.find(
          (p) => p.nome === diet.patientNome && p.cognome === diet.patientCognome
        );
        if (match) pId = match.id;
      }

      setFormData({
        titolo: diet.titolo || '',
        patientId: pId ? String(pId) : (patients.length > 0 ? String(patients[0].id) : ''),
        calorieTarget: diet.calorieTarget !== null && diet.calorieTarget !== undefined ? String(diet.calorieTarget) : '2000',
        proteineTarget: diet.proteineTarget !== null && diet.proteineTarget !== undefined ? String(diet.proteineTarget) : '150',
        carboidratiTarget: diet.carboidratiTarget !== null && diet.carboidratiTarget !== undefined ? String(diet.carboidratiTarget) : '200',
        grassiTarget: diet.grassiTarget !== null && diet.grassiTarget !== undefined ? String(diet.grassiTarget) : '65',
        note: diet.note || '',
      });
    } else {
      setSelectedDietId(null);
      setFormData({
        titolo: '',
        patientId: patients.length > 0 ? String(patients[0].id) : '',
        calorieTarget: '2000',
        proteineTarget: '150',
        carboidratiTarget: '200',
        grassiTarget: '65',
        note: '',
      });
    }
    setShowModal(true);
  }, [patients]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDietId(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dietsData, patientsData] = await Promise.all([
        dietService.getAll(),
        patientService.getAll(),
      ]);
      setDiets(Array.isArray(dietsData) ? dietsData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      console.error('Errore durante il caricamento:', err);
      setError('Errore durante il caricamento dei dati delle diete.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([dietService.getAll(), patientService.getAll()])
      .then(([dietsData, patientsData]) => {
        if (isMounted) {
          setDiets(Array.isArray(dietsData) ? dietsData : []);
          setPatients(Array.isArray(patientsData) ? patientsData : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Errore caricamento iniziale:', err);
          setError('Errore durante il caricamento dei dati delle diete.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      const timer = setTimeout(() => {
        handleOpenModal();
        setSearchParams({}, { replace: true });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams, handleOpenModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const parsedPatientId = Number(formData.patientId);
    if (!parsedPatientId || isNaN(parsedPatientId)) {
      setFormError('Seleziona un paziente valido.');
      return;
    }

    setSubmitting(true);

    const payload = {
      id: selectedDietId ? Number(selectedDietId) : null,
      titolo: formData.titolo,
      note: formData.note,
      patientId: parsedPatientId,
      calorieTarget: formData.calorieTarget ? Number(formData.calorieTarget) : null,
      proteineTarget: formData.proteineTarget ? Number(formData.proteineTarget) : null,
      carboidratiTarget: formData.carboidratiTarget ? Number(formData.carboidratiTarget) : null,
      grassiTarget: formData.grassiTarget ? Number(formData.grassiTarget) : null,
      attiva: true,
    };

    try {
      if (selectedDietId) {
        await dietService.update(selectedDietId, payload);
        setSuccess('Piano nutrizionale aggiornato con successo!');
      } else {
        await dietService.create(payload);
        setSuccess('Nuova dieta creata con successo!');
      }
      handleCloseModal();
      await loadData();
    } catch (err) {
      console.error('Errore salvataggio dieta:', err);
      const msg = err.response?.data?.message || 'Errore durante il salvataggio della dieta.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, titolo) => {
    if (window.confirm(`Sei sicuro di voler eliminare la dieta "${titolo}"?`)) {
      try {
        await dietService.delete(id);
        setSuccess('Dieta eliminata con successo.');
        await loadData();
      } catch (err) {
        console.error('Errore cancellazione:', err);
        setError('Errore durante la cancellazione della dieta.');
      }
    }
  };

  const getPatientName = (diet) => {
    if (diet.patientNome) {
      return `${diet.patientNome} ${diet.patientCognome || ''}`.trim();
    }
    if (diet.patientId) {
      const found = patients.find((p) => Number(p.id) === Number(diet.patientId));
      if (found) return `${found.nome} ${found.cognome}`;
    }
    return 'Non assegnato';
  };

  const filteredDiets = diets.filter((d) => {
    const query = searchTerm.toLowerCase();
    const patientName = getPatientName(d).toLowerCase();
    const title = (d.titolo || '').toLowerCase();
    return title.includes(query) || patientName.includes(query);
  });

  return (
    <div className="min-vh-100">
      <Container fluid="lg" className="pb-5 pt-3">
	
        {/* Header con sfondo --bg e bordi arrotondati rounded-5 */}
        <Row 
            className="rounded-5 p-3 mb-4 align-items-md-center justify-content-between flex-column flex-md-row gap-3" 
            style={{ backgroundColor: 'var(--bg)' }}
        >
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--border)' }}>Piani Nutrizionali</h2>
            <p className="text-muted small mb-0">Gestisci i target calorici e i valori nutrizionali dei tuoi pazienti.</p>
          </div>
          <Button
            className="fw-semibold rounded-pill px-4 border-0 text-white"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={() => handleOpenModal()}
          >
            + Nuova Dieta
          </Button>
        </Row>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <Card.Header className="bg-white border-0 p-3 p-md-4">
            <InputGroup style={{ maxWidth: '400px' }}>
              <InputGroup.Text className="bg-light border-end-0">🔍</InputGroup.Text>
              <Form.Control
                placeholder="Cerca per titolo dieta o nome paziente..."
                className="bg-light border-start-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Card.Header>

          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--primary)' }} />
                <p className="text-muted mt-2 mb-0">Caricamento diete...</p>
              </div>
            ) : filteredDiets.length === 0 ? (
              <div className="p-5 text-center text-muted">
                {searchTerm ? 'Nessuna dieta corrisponde ai criteri di ricerca.' : 'Nessun piano nutrizionale presente. Clicca su "Nuova Dieta" per creare il primo.'}
              </div>
            ) : (
              <Table responsive hover className="align-middle mb-0">
                <thead className="bg-light text-muted small">
                  <tr>
                    <th className="ps-4">Titolo Dieta</th>
                    <th>Paziente Associato</th>
                    <th>Calorie Target</th>
                    <th>Ripartizione Macronutrienti (P / C / F)</th>
                    <th className="text-end pe-4">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiets.map((diet) => (
                    <tr key={diet.id}>
                      <td className="ps-4">
                        <span className="fw-bold d-block" style={{ color: 'var(--border)' }}>{diet.titolo}</span>
                        {diet.note && <span className="text-muted small">{diet.note}</span>}
                      </td>
                      <td>
                        <span className="fw-semibold">
                          {getPatientName(diet)}
                        </span>
                      </td>
                      <td>
                        <Badge className="fs-6 px-3 py-2 rounded-pill fw-bold border-0 text-white" style={{ backgroundColor: 'var(--primary)' }}>
                          {diet.calorieTarget ?? 0} kcal
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Badge bg="danger" className="fw-normal">
                            Prot: {diet.proteineTarget ?? 0}g
                          </Badge>
                          <Badge bg="warning" text="dark" className="fw-normal">
                            Carb: {diet.carboidratiTarget ?? 0}g
                          </Badge>
                          <Badge bg="info" className="fw-normal">
                            Gras: {diet.grassiTarget ?? 0}g
                          </Badge>
                        </div>
                      </td>
                      <td className="text-end pe-4">
                        {/* Dieta Personalizzata */}
                        <Button
                          size="sm"
                          className="rounded-pill me-2 px-3 fw-semibold border-0 text-white"
                          style={{ backgroundColor: 'var(--primary)' }}
                          onClick={() => navigate(`/diets/edit/${diet.id}`)}
                        >
                          Personalizzata
                        </Button>

                        {/* Modifica Target */}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-pill me-2 px-3 fw-semibold"
                          onClick={() => handleOpenModal(diet)}
                        >
                          ✏ Target
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-pill px-3"
                          onClick={() => handleDelete(diet.id, diet.titolo)}
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

      {/* Modale Creazione / Modifica Dieta */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: 'var(--border)' }}>
            {selectedDietId ? 'Modifica Target Nutrizionali' : 'Nuova Dieta'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            {formError && <Alert variant="danger" className="py-2 small">{formError}</Alert>}

            <Row className="g-3">
              <Col md={7}>
                <Form.Group controlId="dietTitolo">
                  <Form.Label className="fw-semibold small">Titolo Piano *</Form.Label>
                  <Form.Control
                    type="text"
                    name="titolo"
                    placeholder="es. Ipertrofia 2500 kcal / Ipocalorica LCHF"
                    value={formData.titolo}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group controlId="dietPaziente">
                  <Form.Label className="fw-semibold small">Assegna a Paziente *</Form.Label>
                  <Form.Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Seleziona un paziente...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} {p.cognome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <hr className="my-2 text-muted" />
                <h6 className="fw-bold text-secondary mb-3">Target Nutrizionali Giornalieri</h6>
              </Col>

              <Col md={3}>
                <Form.Group controlId="dietCalorie">
                  <Form.Label className="fw-semibold small" style={{ color: 'var(--primary)' }}>Calorie (kcal) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="calorieTarget"
                    placeholder="2000"
                    value={formData.calorieTarget}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="dietProteine">
                  <Form.Label className="fw-semibold small text-danger">Proteine (g) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="proteineTarget"
                    placeholder="150"
                    value={formData.proteineTarget}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="dietCarboidrati">
                  <Form.Label className="fw-semibold small text-warning">Carboidrati (g) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="carboidratiTarget"
                    placeholder="200"
                    value={formData.carboidratiTarget}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="dietGrassi">
                  <Form.Label className="fw-semibold small text-info">Grassi (g) *</Form.Label>
                  <Form.Control
                    type="number"
                    svg="true"
                    step="0.1"
                    name="grassiTarget"
                    placeholder="65"
                    value={formData.grassiTarget}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="dietNote">
                  <Form.Label className="fw-semibold small">Note / Indicazioni aggiuntive</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="note"
                    placeholder="es. Bere almeno 2L d'acqua al giorno, evitare zuccheri raffinati."
                    value={formData.note}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={handleCloseModal} disabled={submitting}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              className="px-4 fw-semibold border-0 text-white" 
              style={{ backgroundColor: 'var(--primary)' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                  Salvataggio...
                </>
              ) : (
                'Salva Target'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DietsList;
