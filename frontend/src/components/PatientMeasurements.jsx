import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getMeasurementsByPatient,
  createMeasurement,
  deleteMeasurement
} from '../services/measurementService';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function PatientMeasurements({ patientId: propPatientId }) {
  const params = useParams();
  const activePatientId = propPatientId || params.id || params.patientId;

  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State iniziale
  const initialFormState = {
    dataMisurazione: new Date().toISOString().split('T')[0],
    peso: '',
    altezza: '',
    massaGrassaPercentuale: '',
    massaMagraPercentuale: '',
    circonferenzaVita: '',
    circonferenzaFianchi: '',
    circonferenzaBraccio: '',
    circonferenzaCoscia: '',
    note: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const refreshMeasurements = useCallback(async () => {
    if (!activePatientId) return;
    try {
      setLoading(true);
      const data = await getMeasurementsByPatient(activePatientId);
      setMeasurements(data || []);
    } catch (error) {
      console.error('Errore nel caricamento delle misurazioni:', error);
    } finally {
      setLoading(false);
    }
  }, [activePatientId]);

  useEffect(() => {
    let active = true;

    if (activePatientId) {
      getMeasurementsByPatient(activePatientId)
        .then((data) => {
          if (active) {
            setMeasurements(data || []);
          }
        })
        .catch((error) => {
          console.error('Errore nel caricamento delle misurazioni:', error);
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    } else {
      Promise.resolve().then(() => {
        if (active) {
          setLoading(false);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [activePatientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calcolo BMI in tempo reale per la preview nel form
  const calculatePreviewBmi = () => {
    const p = parseFloat(formData.peso);
    const a = parseFloat(formData.altezza);
    if (p > 0 && a > 0) {
      const altM = a / 100;
      return (p / (altM * altM)).toFixed(1);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activePatientId) {
      alert("Errore: ID paziente non trovato!");
      return;
    }

    try {
      const payload = {
        dataMisurazione: formData.dataMisurazione,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        altezza: formData.altezza ? parseFloat(formData.altezza) : null,
        massaGrassaPercentuale: formData.massaGrassaPercentuale ? parseFloat(formData.massaGrassaPercentuale) : null,
        massaMagraPercentuale: formData.massaMagraPercentuale ? parseFloat(formData.massaMagraPercentuale) : null,
        circonferenzaVita: formData.circonferenzaVita ? parseFloat(formData.circonferenzaVita) : null,
        circonferenzaFianchi: formData.circonferenzaFianchi ? parseFloat(formData.circonferenzaFianchi) : null,
        circonferenzaBraccio: formData.circonferenzaBraccio ? parseFloat(formData.circonferenzaBraccio) : null,
        circonferenzaCoscia: formData.circonferenzaCoscia ? parseFloat(formData.circonferenzaCoscia) : null,
        note: formData.note,
        patientId: Number(activePatientId)
      };

      await createMeasurement(payload);
      setFormData(initialFormState);
      setShowForm(false);
      refreshMeasurements();
    } catch (error) {
      console.error('Errore durante il salvataggio della misurazione:', error);
      alert('Impossibile salvare la misurazione. Controlla la console per i dettagli.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa misurazione?')) {
      try {
        await deleteMeasurement(id);
        refreshMeasurements();
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        alert("Errore durante l'eliminazione della misurazione.");
      }
    }
  };

  const latest = measurements.length > 0 ? measurements[0] : null;
  const previewBmi = calculatePreviewBmi();

  // Dati ordinati cronologicamente (dal più vecchio al più recente) per il grafico
  const chartData = [...measurements].reverse();

  if (loading) return <div className="text-center my-4">Caricamento misurazioni...</div>;

  return (
    <div className="container-fluid py-3">
      {/* HEADER E PULSANTE NUOVA MISURAZIONE */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="m-0 fw-bold">Storico e Misurazioni Antropometriche</h4>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Annulla' : '+ Nuova Misurazione'}
        </button>
      </div>

      {/* CARD ULTIMA RILEVAZIONE (KPI) */}
      {latest && !showForm && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <span className="text-muted small">Peso Attuale</span>
              <h3 className="fw-bold text-primary m-0">{latest.peso ? `${latest.peso} kg` : '-'}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <span className="text-muted small">Altezza</span>
              <h3 className="fw-bold text-secondary m-0">{latest.altezza ? `${latest.altezza} cm` : '-'}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <span className="text-muted small">BMI (IMC)</span>
              <h3 className="fw-bold text-success m-0">{latest.bmi ?? '-'}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <span className="text-muted small">Massa Grassa / Magra</span>
              <h4 className="fw-bold text-dark m-0">
                {latest.massaGrassaPercentuale ? `${latest.massaGrassaPercentuale}%` : '-'} / {latest.massaMagraPercentuale ? `${latest.massaMagraPercentuale}%` : '-'}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* GRAFICO DI ANDAMENTO RECHARTS */}
      {measurements.length > 1 && !showForm && (
        <div className="card border-0 shadow-sm p-4 mb-4">
          <h5 className="fw-bold mb-3 text-secondary">Andamento Peso e BMI nel Tempo</h5>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dataMisurazione" />
                <YAxis yAxisId="left" domain={['auto', 'auto']} label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} label={{ value: 'BMI', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="peso" stroke="#0d6efd" name="Peso (kg)" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="#198754" name="BMI" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* FORM NUOVA MISURAZIONE */}
      {showForm && (
        <div className="card border-0 shadow-sm p-4 mb-4 bg-light">
          <h5 className="fw-bold mb-3">Inserisci Nuova Rilevazione</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Data Misurazione</label>
                <input 
                  type="date" 
                  className="form-control"
                  name="dataMisurazione"
                  value={formData.dataMisurazione}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Peso (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  placeholder="Es. 70.5"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Altezza (cm)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control"
                  name="altezza"
                  value={formData.altezza}
                  onChange={handleChange}
                  placeholder="Es. 175"
                />
              </div>

              {previewBmi && (
                <div className="col-12">
                  <div className="alert alert-info py-2 m-0">
                    <strong>BMI Calcolato (Anteprima):</strong> {previewBmi}
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">Massa Grassa (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control"
                  name="massaGrassaPercentuale"
                  value={formData.massaGrassaPercentuale}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Massa Magra (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control"
                  name="massaMagraPercentuale"
                  value={formData.massaMagraPercentuale}
                  onChange={handleChange}
                />
              </div>

              <h6 className="fw-bold mt-4 mb-2">Circonferenze (cm)</h6>
              <div className="col-md-3">
                <label className="form-label">Vita</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control"
                  name="circonferenzaVita"
                  value={formData.circonferenzaVita}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Fianchi</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control"
                  name="circonferenzaFianchi"
                  value={formData.circonferenzaFianchi}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Braccio</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control"
                  name="circonferenzaBraccio"
                  value={formData.circonferenzaBraccio}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Coscia</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-control"
                  name="circonferenzaCoscia"
                  value={formData.circonferenzaCoscia}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Note Cliniche</label>
                <textarea 
                  className="form-control"
                  rows="2"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Annotazioni su ritenzione, condizioni di misurazione..."
                />
              </div>

              <div className="col-12 text-end mt-3">
                <button type="submit" className="btn btn-success me-2">Salva Misurazione</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Annulla</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TABELLA STORICO MISURAZIONI */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                  <th>Altezza</th>
                  <th>BMI</th>
                  <th>Massa Grassa %</th>
                  <th>Circ. Vita</th>
                  <th>Circ. Fianchi</th>
                  <th>Note</th>
                  <th className="text-center">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {measurements.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      Nessuna misurazione registrata per questo paziente.
                    </td>
                  </tr>
                ) : (
                  measurements.map((m) => (
                    <tr key={m.id}>
                      <td className="fw-semibold">{m.dataMisurazione}</td>
                      <td>{m.peso ? `${m.peso} kg` : '-'}</td>
                      <td>{m.altezza ? `${m.altezza} cm` : '-'}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {m.bmi ?? '-'}
                        </span>
                      </td>
                      <td>{m.massaGrassaPercentuale ? `${m.massaGrassaPercentuale}%` : '-'}</td>
                      <td>{m.circonferenzaVita ? `${m.circonferenzaVita} cm` : '-'}</td>
                      <td>{m.circonferenzaFianchi ? `${m.circonferenzaFianchi} cm` : '-'}</td>
                      <td className="text-truncate" style={{ maxWidth: '150px' }}>{m.note || '-'}</td>
                      <td className="text-center">
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(m.id)}
                          title="Elimina"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}