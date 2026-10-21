// src/components/DietEditor.jsx
import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, ProgressBar } from 'react-bootstrap';
import { calculateDayTotals, calculateMealTotals } from '../utils/nutritionUtils';
import { generateDietPdf } from '../utils/dietPdfGenerator';

const DAYS_OF_WEEK = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DEFAULT_MEALS = ["Colazione", "Spuntino Mattina", "Pranzo", "Spuntino Pomeriggio", "Cena"];

const createDefaultDailyPlans = () => {
  return DAYS_OF_WEEK.map((giorno, idx) => ({
    nomeGiorno: giorno,
    ordine: idx + 1,
    meals: DEFAULT_MEALS.map((nome, mIdx) => ({
      nome,
      ordine: mIdx + 1,
      mealItems: []
    }))
  }));
};

export default function DietEditor({ 
  initialDiet, 
  foodsList = [], 
  onSave = () => {}, 
  onOpenSearchModal = () => {},
  onOpenManualFoodModal = () => {} 
}) {
  const [diet, setDiet] = useState(() => {
    const defaultPlans = createDefaultDailyPlans();
    if (initialDiet && Array.isArray(initialDiet.dailyPlans) && initialDiet.dailyPlans.length > 0) {
      return initialDiet;
    }
    return {
      titolo: initialDiet?.titolo || 'Nuova Dieta',
      note: initialDiet?.note || '',
      patientId: initialDiet?.patientId || '',
      calorieTarget: initialDiet?.calorieTarget || 2000,
      proteineTarget: initialDiet?.proteineTarget || 150,
      carboidratiTarget: initialDiet?.carboidratiTarget || 200,
      grassiTarget: initialDiet?.grassiTarget || 60,
      dailyPlans: defaultPlans
    };
  });

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const dailyPlans = Array.isArray(diet.dailyPlans) && diet.dailyPlans.length > 0 
    ? diet.dailyPlans 
    : createDefaultDailyPlans();

  const currentDay = dailyPlans[activeDayIndex] || dailyPlans[0];
  const mealList = currentDay?.meals || [];
  const dayTotals = calculateDayTotals(mealList, foodsList);

  const handleOpenSearch = () => {
    if (typeof onOpenSearchModal === 'function') {
      onOpenSearchModal();
    }
  };

  const handleOpenManual = () => {
    if (typeof onOpenManualFoodModal === 'function') {
      onOpenManualFoodModal();
    }
  };

  const handleDietChange = (field, value) => {
    setDiet((prev) => ({ ...prev, [field]: value }));
  };

  const updateDailyPlans = (updater) => {
    setDiet((prevDiet) => {
      const currentPlans = Array.isArray(prevDiet.dailyPlans) && prevDiet.dailyPlans.length > 0
        ? prevDiet.dailyPlans
        : createDefaultDailyPlans();

      const newPlans = structuredClone(currentPlans);
      if (newPlans[activeDayIndex]) {
        updater(newPlans[activeDayIndex]);
      }
      return { ...prevDiet, dailyPlans: newPlans };
    });
  };

  const handleItemGramChange = (mealIdx, itemIdx, grammi) => {
    updateDailyPlans((day) => {
      if (day.meals[mealIdx]?.mealItems[itemIdx]) {
        day.meals[mealIdx].mealItems[itemIdx].grammi = Number(grammi);
      }
    });
  };

  const handleFoodSelect = (mealIdx, itemIdx, foodId) => {
    updateDailyPlans((day) => {
      if (day.meals[mealIdx]?.mealItems[itemIdx]) {
        day.meals[mealIdx].mealItems[itemIdx].foodId = foodId;
      }
    });
  };

  const addMealItem = (mealIdx) => {
    updateDailyPlans((day) => {
      if (day.meals[mealIdx]) {
        if (!day.meals[mealIdx].mealItems) {
          day.meals[mealIdx].mealItems = [];
        }
        day.meals[mealIdx].mealItems.push({
          foodId: foodsList[0]?.id || '',
          grammi: 100,
          note: ''
        });
      }
    });
  };

  const removeMealItem = (mealIdx, itemIdx) => {
    updateDailyPlans((day) => {
      if (day.meals[mealIdx]?.mealItems) {
        day.meals[mealIdx].mealItems.splice(itemIdx, 1);
      }
    });
  };

  return (
    <Container fluid className="px-0 py-2">
      
      {/* Testata: Titolo e Note */}
      <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="dietTitle">
                <Form.Label className="fw-semibold small" style={{ color: 'var(--border)' }}>
                  Titolo della Dieta
                </Form.Label>
                <Form.Control
                  type="text"
                  className="rounded-pill px-3"
                  value={diet.titolo || ''}
                  onChange={(e) => handleDietChange('titolo', e.target.value)}
                  placeholder="Es. Dieta Iperproteica - Fase 1"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="dietNotes">
                <Form.Label className="fw-semibold small" style={{ color: 'var(--border)' }}>
                  Note per il Paziente
                </Form.Label>
                <Form.Control
                  type="text"
                  className="rounded-pill px-3"
                  value={diet.note || ''}
                  onChange={(e) => handleDietChange('note', e.target.value)}
                  placeholder="Es. Bere almeno 2L d'acqua al giorno"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Target Nutrizionali & Barra di Progresso */}
      <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col md={3}>
              <span className="text-muted small fw-semibold text-uppercase d-block mb-1">
                Totale Giornaliero
              </span>
              <h4 className="fw-bold mb-0" style={{ color: 'var(--primary)' }}>
                {currentDay?.nomeGiorno}
              </h4>
            </Col>

            <Col md={9}>
              <Row className="text-center g-3">
                <Col xs={6} sm={3}>
                  <small className="text-muted d-block fw-semibold mb-1">Calorie</small>
                  <div className="small mb-1">
                    <strong style={{ color: 'var(--border)' }}>{dayTotals.calorie}</strong> / {diet.calorieTarget} kcal
                  </div>
                  <ProgressBar 
                    now={(dayTotals.calorie / (diet.calorieTarget || 1)) * 100} 
                    variant={dayTotals.calorie > diet.calorieTarget ? "danger" : "success"} 
                    style={{ height: '6px' }}
                    className="rounded-pill"
                  />
                </Col>

                <Col xs={6} sm={3}>
                  <small className="text-muted d-block fw-semibold mb-1">Proteine</small>
                  <div className="small mb-1">
                    <strong style={{ color: 'var(--border)' }}>{dayTotals.proteine}</strong> / {diet.proteineTarget} g
                  </div>
                  <ProgressBar 
                    now={(dayTotals.proteine / (diet.proteineTarget || 1)) * 100} 
                    variant="danger" 
                    style={{ height: '6px' }}
                    className="rounded-pill"
                  />
                </Col>

                <Col xs={6} sm={3}>
                  <small className="text-muted d-block fw-semibold mb-1">Carboidrati</small>
                  <div className="small mb-1">
                    <strong style={{ color: 'var(--border)' }}>{dayTotals.carboidrati}</strong> / {diet.carboidratiTarget} g
                  </div>
                  <ProgressBar 
                    now={(dayTotals.carboidrati / (diet.carboidratiTarget || 1)) * 100} 
                    variant="warning" 
                    style={{ height: '6px' }}
                    className="rounded-pill"
                  />
                </Col>

                <Col xs={6} sm={3}>
                  <small className="text-muted d-block fw-semibold mb-1">Grassi</small>
                  <div className="small mb-1">
                    <strong style={{ color: 'var(--border)' }}>{dayTotals.grassi}</strong> / {diet.grassiTarget} g
                  </div>
                  <ProgressBar 
                    now={(dayTotals.grassi / (diet.grassiTarget || 1)) * 100} 
                    variant="info" 
                    style={{ height: '6px' }}
                    className="rounded-pill"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs dei 7 Giorni della Settimana */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {dailyPlans.map((plan, idx) => {
          const isActive = activeDayIndex === idx;
          return (
            <Button
              key={idx}
              className="rounded-pill px-4 py-2 fw-semibold border-0 transition-all shadow-sm"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--border)'
              }}
              onClick={() => setActiveDayIndex(idx)}
            >
              {plan.nomeGiorno}
            </Button>
          );
        })}
      </div>

      {/* Lista dei Pasti del Giorno Selezionato */}
      {mealList.map((meal, mealIdx) => {
        const items = meal.mealItems || [];
        const mealTotals = calculateMealTotals(items, foodsList);

        return (
          <Card key={mealIdx} className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden bg-white">
            <Card.Header className="bg-white border-bottom-0 d-flex justify-content-between align-items-center p-3 px-4">
              <h5 className="mb-0 fw-bold" style={{ color: 'var(--border)' }}>
                {meal.nome}
              </h5>
              <div className="d-flex gap-3 text-muted small fw-semibold">
                <span style={{ color: 'var(--primary)' }}>🔥 {mealTotals.calorie} kcal</span>
                <span>P: {mealTotals.proteine}g</span>
                <span>C: {mealTotals.carboidrati}g</span>
                <span>G: {mealTotals.grassi}g</span>
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              <Table responsive hover align="middle" className="mb-0">
                <thead className="bg-light text-muted small">
                  <tr>
                    <th className="ps-4" style={{ width: '45%' }}>Alimento</th>
                    <th style={{ width: '20%' }}>Grammi</th>
                    <th style={{ width: '25%' }}>Valori Nutrizionali</th>
                    <th className="text-end pe-4" style={{ width: '10%' }}>Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4 small">
                        Nessun alimento aggiunto a questo pasto.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, itemIdx) => {
                      const itemMacros = calculateMealTotals([item], foodsList);
                      return (
                        <tr key={itemIdx}>
                          <td className="ps-4">
                            <Form.Select
                              size="sm"
                              className="rounded-pill px-3 border-0 bg-light"
                              value={item.foodId || ''}
                              onChange={(e) => handleFoodSelect(mealIdx, itemIdx, e.target.value)}
                            >
                              <option value="">Seleziona alimento dal catalogo...</option>
                              {foodsList.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.nome} ({f.calorie} kcal/100g)
                                </option>
                              ))}
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              className="rounded-pill px-3 border-0 bg-light"
                              style={{ maxWidth: '120px' }}
                              value={item.grammi || ''}
                              onChange={(e) => handleItemGramChange(mealIdx, itemIdx, e.target.value)}
                              min="1"
                            />
                          </td>
                          <td className="small text-muted">
                            <strong>{itemMacros.calorie}</strong> kcal | P: {itemMacros.proteine}g C: {itemMacros.carboidrati}g G: {itemMacros.grassi}g
                          </td>
                          <td className="text-end pe-4">
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              className="rounded-circle p-1 d-inline-flex align-items-center justify-content-center"
                              style={{ width: '28px', height: '28px' }}
                              onClick={() => removeMealItem(mealIdx, itemIdx)}
                              title="Rimuovi alimento"
                            >
                              ✕
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
              
              {/* Tre bottoni distinti per ciascun pasto */}
              <div className="d-flex flex-wrap gap-2 p-3 px-4 border-top bg-light">
                <Button 
                  size="sm" 
                  className="rounded-pill px-3 fw-semibold border-0 text-white shadow-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                  onClick={() => addMealItem(mealIdx)}
                >
                  + Aggiungi Alimento dal Catalogo
                </Button>

                <Button 
                  variant="outline-secondary"
                  size="sm" 
                  className="rounded-pill px-3 fw-semibold bg-white shadow-sm"
                  onClick={handleOpenManual}
                >
                  ✏️ Crea Nuovo Alimento
                </Button>
                
                <Button 
                  variant="light"
                  size="sm" 
                  className="rounded-pill px-3 fw-semibold shadow-sm border-0"
                  onClick={handleOpenSearch}
                >
                  🔍 Cerca su Open Food Facts
                </Button>
              </div>
            </Card.Body>
          </Card>
        );
      })}

      {/* Barra di Azione Finale */}
      <div className="d-flex flex-wrap justify-content-end gap-2 mt-4 pt-2">
        <Button 
          variant="light"
          className="fw-semibold rounded-pill px-4 py-2 border-0 shadow-sm" 
          onClick={() => generateDietPdf(diet, foodsList)}
        >
          📄 Scarica PDF Dieta
        </Button>
        <Button 
          className="fw-semibold rounded-pill px-4 py-2 border-0 text-white shadow-sm" 
          style={{ backgroundColor: 'var(--primary)' }}
          onClick={() => onSave(diet)}
        >
          Salva Dieta Completa
        </Button>
      </div>
    </Container>
  );
}
