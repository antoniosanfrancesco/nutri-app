// src/components/OpenFoodModal.jsx
import { useState } from 'react';
import { Modal, Button, Form, Table, Spinner, Badge } from 'react-bootstrap';
import foodService from '../services/foodService';

export default function OpenFoodModal({ show, onHide, onFoodImported }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const data = await foodService.searchExternal(query);
      setResults(data);
    } catch (err) {
      console.error('Errore durante la ricerca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (food) => {
    try {
      // Salva nel database PostgreSQL locale
      const savedFood = await foodService.create({
        nome: food.nome,
        calorie: food.calorie,
        proteine: food.proteine,
        carboidrati: food.carboidrati,
        grassi: food.grassi,
        categoria: 'Open Food Facts'
      });

      alert(`"${food.nome}" aggiunto al catalogo locale!`);
      if (onFoodImported) onFoodImported(savedFood);
    } catch (err) {
      console.error('Errore nel salvataggio dell alimento:', err);
      alert('Impossibile salvare l alimento.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Cerca Alimento su Open Food Facts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
          <Form.Control
            type="text"
            placeholder="Es. Pasta Barilla, Yogurt Greco, Mela..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Cerca'}
          </Button>
        </Form>

        <Table responsive hover align="middle">
          <thead>
            <tr>
              <th>Nome / Marca</th>
              <th>Calorie</th>
              <th>P / C / G (100g)</th>
              <th>Azione</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, idx) => (
              <tr key={idx}>
                <td className="fw-bold">{item.nome}</td>
                <td><Badge bg="secondary">{item.calorie} kcal</Badge></td>
                <td className="small text-muted">
                  P: {item.proteine}g | C: {item.carboidrati}g | G: {item.grassi}g
                </td>
                <td>
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    onClick={() => handleImport(item)}
                  >
                    + Importa
                  </Button>
                </td>
              </tr>
            ))}
            {results.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-3">
                  Inserisci una parola chiave per cercare tra oltre 3 milioni di prodotti.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
}