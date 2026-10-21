import api from '../api/axiosInstance';

export const measurementService = {
  /**
   * Recupera lo storico completo di tutte le misurazioni di uno specifico paziente.
   * @param {number|string} patientId 
   * @returns {Promise<Array>} Lista di MeasurementDto
   */
  getByPatient: async (patientId) => {
    const response = await api.get(`/measurements/patient/${patientId}`);
    return response.data;
  },

  /**
   * Recupera solo l'ultima misurazione effettuata per il paziente.
   * @param {number|string} patientId 
   * @returns {Promise<Object>} MeasurementDto
   */
  getLatestByPatient: async (patientId) => {
    const response = await api.get(`/measurements/patient/${patientId}/latest`);
    return response.data;
  },

  /**
   * Registra una nuova misurazione antropometrica.
   * @param {Object} measurementData 
   * @returns {Promise<Object>} MeasurementDto creato con id
   */
  create: async (measurementData) => {
    const response = await api.post('/measurements', measurementData);
    return response.data;
  },

  /**
   * Modifica i dati di una misurazione già esistente.
   * @param {number|string} id 
   * @param {Object} measurementData 
   * @returns {Promise<Object>} MeasurementDto aggiornato
   */
  update: async (id, measurementData) => {
    const response = await api.put(`/measurements/${id}`, measurementData);
    return response.data;
  },

  /**
   * Elimina una misurazione.
   * @param {number|string} id 
   */
  delete: async (id) => {
    await api.delete(`/measurements/${id}`);
  }
};

// Esportazioni singole per compatibilità
export const getMeasurementsByPatient = measurementService.getByPatient;
export const getLatestMeasurement = measurementService.getLatestByPatient;
export const createMeasurement = measurementService.create;
export const updateMeasurement = measurementService.update;
export const deleteMeasurement = measurementService.delete;

export default measurementService;