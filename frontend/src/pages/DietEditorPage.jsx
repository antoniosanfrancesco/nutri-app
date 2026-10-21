// src/pages/DietEditorPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'; 
import { Container, Spinner, Alert, Button, Row, Col, Badge, Modal, Form } from 'react-bootstrap';
import DietEditor from '../components/DietEditor';
import OpenFoodModal from '../components/OpenModal';
import dietService from '../services/dietService';
import foodService from '../services/foodService';

const initialManualFoodState = {
  nome: '',
  calorie: '',
  proteine: '',
  carboidrati: '',
  grassi: '',
};

export default function DietEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams(); 
  const navigate = useNavigate();

  // Lettura parametri opzionali dall'URL (es. /diets/new?patientId=1&baseDietId=3)
  const patientIdFromUrl = searchParams.get('patientId');
  const baseDietIdFromUrl = searchParams.get('baseDietId');

  const [diet, setDiet] = useState(null);
  const [foods, setFoods] = useState([]);
  const [showOpenFoodModal, setShowOpenFoodModal] = useState(false);
  
  // Stati per la modale di inserimento manuale alimento
  const [showManualFoodModal, setShowManualFoodModal] = useState(false);
  const [manualFoodData, setManualFoodData] = useState(initialManualFoodState);
  const [submittingFood, setSubmittingFood] = useState(false);
  const [foodError, setFoodError] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleFoodImported = (newFood) => {
    setFoods((prevFoods) => [...prevFoods, newFood]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Chiamata Cibi
        const foodsData = await foodService.getAll();
        setFoods(foodsData || []);

        // 2. Chiamata Dieta
        const isEditing = id && id !== 'new' && id !== 'undefined';
        
        if (isEditing) {
          const existingDiet = await dietService.getById(id);
          setDiet(existingDiet);
        } else if (baseDietIdFromUrl && baseDietIdFromUrl !== 'undefined') {
          const baseDiet = await dietService.getById(baseDietIdFromUrl);
          setDiet({
            ...baseDiet,
            id: undefined,
            patientId: patientIdFromUrl ? Number(patientIdFromUrl) : baseDiet.patientId,
            titolo: baseDiet.titolo ? `${baseDiet.titolo} (Personalizzata)` : 'Nuova Dieta Personalizzata',
          });
        } else if (patientIdFromUrl && patientIdFromUrl !== 'undefined') {
          setDiet({
            patientId: Number(patientIdFromUrl),
            titolo: 'Nuova Dieta Personalizzata',
          });
        }
      } catch (err) {
        console.error('❌ [ERRORE BACKEND]:', err.response?.data || err.message);
        setError('Impossibile caricare i dati per l\'editor della dieta.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, baseDietIdFromUrl, patientIdFromUrl]);

  const handleSaveDiet = async (dietData) => {
    try {
      setSaveError('');
      if (id && id !== 'new') {
        await dietService.update(id, dietData);
      } else {
        await dietService.create(dietData);
      }
      navigate('/diets');
    } catch (err) {
      console.error('Errore durante il salvataggio della dieta:', err);
      const msg = err.response?.data?.message || 'Errore nel salvataggio della dieta. Controlla i dati inseriti.';
      setSaveError(msg);
    }
  };

  // Gestione creazione alimento manuale
  const handleManualFoodChange = (e) => {
    setManualFoodData({ ...manualFoodData, [e.target.name]: e.target.value });
  };

  const handleSaveManualFood = async (e) => {
    e.preventDefault();
    setFoodError('');
    setSubmittingFood(true);

    try {
      const payload = {
        nome: manualFoodData.nome,
        calorie: Number(manualFoodData.calorie) || 0,
        proteine: Number(manualFoodData.proteine) || 0,
        carboidrati: Number(manualFoodData.carboidrati) || 0,
        grassi: Number(manualFoodData.grassi) || 0,
      };

      const createdFood = foodService.create ? await foodService.create(payload) : payload;
      
      // Aggiunge il cibo alla lista locale dei cibi disponibili nell'editor
      setFoods((prev) => [...prev, createdFood || payload]);
      setShowManualFoodModal(false);
      setManualFoodData(initialManualFoodState);
    } catch (err) {
      console.error('Errore salvataggio alimento manuale:', err);
      setFoodError('Errore durante il salvataggio dell\'alimento.');
    } finally {
      setSubmittingFood(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <Container className="text-center py-5">
          <Spinner animation="border" style={{ color: 'var(--primary)' }} />
          <p className="mt-3 text-muted fw-semibold">Caricamento Editor Dieta in corso...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100 pb-5">
      <Container fluid="lg" className="pt-3">
        
        {/* Pulsante di Ritorno */}
        <Button 
          variant="outline-secondary" 
          size="sm" 
          className="rounded-pill mb-3 px-3 fw-semibold shadow-sm" 
          onClick={() => navigate('/diets')}
        >
          ← Torna ai Piani Nutrizionali
        </Button>

        {/* Header Principale con Sfondo --bg e Bordi rounded-5 */}
        <Row 
          className="rounded-5 p-4 mb-4 align-items-center justify-content-between g-3"
          style={{ backgroundColor: 'var(--bg)' }}
        >
          <Col md={6} className="ms-md-2">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="fw-bold mb-0" style={{ color: 'var(--border)' }}>
                {diet?.id ? `Editor: ${diet.titolo || 'Piano Nutrizionale'}` : 'Nuovo Menu Personalizzato'}
              </h2>
              {diet?.id && (
                <Badge className="rounded-pill px-3 py-2 border-0 text-white shadow-sm" style={{ backgroundColor: 'var(--primary)' }}>
                  In Modifica
                </Badge>
              )}
            </div>
            <p className="text-muted small mb-0">
              Componi e struttura la dieta giornaliera selezionando gli alimenti dal database.
            </p>
          </Col>

          <Col md={5} className="text-md-end d-flex gap-2 justify-content-md-end align-items-center flex-wrap">
            {/* Pulsante per aggiungere alimento manualmente */}
            <Button
              variant="light"
              size="sm"
              className="rounded-pill px-3 fw-semibold shadow-sm"
              onClick={() => setShowManualFoodModal(true)}
            >
              + Nuovo Alimento
            </Button>

            {/* Pulsante per importare cibi da OpenFoodFacts */}
            <Button
              variant="light"
              size="sm"
              className="rounded-pill px-3 fw-semibold shadow-sm"
              onClick={() => setShowOpenFoodModal(true)}
            >
              🔍 Cerca su OpenFood
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">{error}</Alert>}
        {saveError && <Alert variant="danger" dismissible onClose={() => setSaveError('')} className="mb-4">{saveError}</Alert>}

        {/* Wrapper diet-editor con connessione a tutte le modali */}
        <div className="diet-editor">
          <DietEditor 
            key={diet ? (diet.id || `patient-${diet.patientId}`) : 'new-diet'}
            initialDiet={diet} 
            foodsList={foods} 
            onSave={handleSaveDiet} 
            onOpenSearchModal={() => setShowOpenFoodModal(true)} 
            onOpenManualFoodModal={() => setShowManualFoodModal(true)}
          />
        </div>

        {/* Modale OpenFood */}
        <OpenFoodModal
          show={showOpenFoodModal}
          onHide={() => setShowOpenFoodModal(false)}
          onFoodImported={handleFoodImported}
        />

        {/* Modale Inserimento Manuale Alimento */}
        <Modal show={showManualFoodModal} onHide={() => setShowManualFoodModal(false)} centered size="md" backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold" style={{ color: 'var(--border)' }}>
              Aggiungi Alimento Manualmente
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveManualFood}>
            <Modal.Body className="pt-3">
              {foodError && <Alert variant="danger" className="py-2 small">{foodError}</Alert>}
              
              <Form.Group className="mb-3" controlId="manualFoodName">
                <Form.Label className="fw-semibold small">Nome Alimento *</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  placeholder="es. Petto di pollo grigliato"
                  value={manualFoodData.nome}
                  onChange={handleManualFoodChange}
                  required
                  autoFocus
                  className="rounded-pill px-3"
                />
              </Form.Group>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="manualFoodCalorie">
                    <Form.Label className="fw-semibold small text-success">Calorie (kcal / 100g) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="calorie"
                      placeholder="165"
                      value={manualFoodData.calorie}
                      onChange={handleManualFoodChange}
                      required
                      className="rounded-pill px-3"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="manualFoodProteine">
                    <Form.Label className="fw-semibold small text-danger">Proteine (g / 100g) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="proteine"
                      placeholder="31"
                      value={manualFoodData.proteine}
                      onChange={handleManualFoodChange}
                      required
                      className="rounded-pill px-3"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="manualFoodCarboidrati">
                    <Form.Label className="fw-semibold small text-warning">Carboidrati (g / 100g) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="carboidrati"
                      placeholder="0"
                      value={manualFoodData.carboidrati}
                      onChange={handleManualFoodChange}
                      required
                      className="rounded-pill px-3"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="manualFoodGrassi">
                    <Form.Label className="fw-semibold small text-info">Grassi (g / 100g) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="grassi"
                      placeholder="3.6"
                      value={manualFoodData.grassi}
                      onChange={handleManualFoodChange}
                      required
                      className="rounded-pill px-3"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button 
                variant="light" 
                className="rounded-pill px-3 fw-semibold" 
                onClick={() => setShowManualFoodModal(false)}
                disabled={submittingFood}
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                className="rounded-pill px-4 fw-semibold border-0 text-white shadow-sm"
                style={{ backgroundColor: 'var(--primary)' }}
                disabled={submittingFood}
              >
                {submittingFood ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                    Salvataggio...
                  </>
                ) : (
                  'Salva Alimento'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

      </Container>
    </div>
  );
}
