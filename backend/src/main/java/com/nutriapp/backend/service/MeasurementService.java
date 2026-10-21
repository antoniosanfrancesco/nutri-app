package com.nutriapp.backend.service;

import com.nutriapp.backend.dto.MeasurementDto;
import com.nutriapp.backend.entity.Measurement;
import com.nutriapp.backend.entity.Patient;
import com.nutriapp.backend.repository.MeasurementRepository;
import com.nutriapp.backend.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MeasurementService {

    private final MeasurementRepository measurementRepository;
    private final PatientRepository patientRepository;

    public MeasurementService(MeasurementRepository measurementRepository, PatientRepository patientRepository) {
        this.measurementRepository = measurementRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public List<MeasurementDto> getMeasurementsByPatient(Long patientId) {
        return measurementRepository.findByPatientIdOrderByDataMisurazioneDesc(patientId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public MeasurementDto getLatestMeasurementByPatient(Long patientId) {
        return measurementRepository.findTopByPatientIdOrderByDataMisurazioneDesc(patientId)
                .map(this::mapToDto)
                .orElse(null);
    }

    public MeasurementDto createMeasurement(MeasurementDto dto, Long nutritionistId) {
        Patient patient = patientRepository.findByIdAndNutritionistId(dto.getPatientId(), nutritionistId)
                .orElseThrow(() -> new RuntimeException("Paziente non trovato o non associato a questo nutrizionista"));

        Measurement measurement = new Measurement();
        mapToEntity(dto, measurement, patient);

        Measurement saved = measurementRepository.save(measurement);
        return mapToDto(saved);
    }

    public MeasurementDto updateMeasurement(Long id, MeasurementDto dto, Long nutritionistId) {
        Measurement measurement = measurementRepository.findByIdAndPatientNutritionistId(id, nutritionistId)
                .orElseThrow(() -> new RuntimeException("Misurazione non trovata o non modificabile"));

        mapToEntity(dto, measurement, measurement.getPatient());

        Measurement updated = measurementRepository.save(measurement);
        return mapToDto(updated);
    }

    public void deleteMeasurement(Long id, Long nutritionistId) {
        Measurement measurement = measurementRepository.findByIdAndPatientNutritionistId(id, nutritionistId)
                .orElseThrow(() -> new RuntimeException("Misurazione non trovata o non eliminabile"));

        measurementRepository.delete(measurement);
    }

    // --- MAPPING HELPER METODI ---

    private MeasurementDto mapToDto(Measurement entity) {
        MeasurementDto dto = new MeasurementDto();
        dto.setId(entity.getId());
        dto.setPatientId(entity.getPatient().getId());
        dto.setDataMisurazione(entity.getDataMisurazione());
        dto.setPeso(entity.getPeso());
        dto.setAltezza(entity.getAltezza());
        dto.setBmi(entity.getBmi());
        dto.setMassaGrassaPercentuale(entity.getMassaGrassaPercentuale());
        dto.setMassaMagraPercentuale(entity.getMassaMagraPercentuale());
        dto.setCirconferenzaVita(entity.getCirconferenzaVita());
        dto.setCirconferenzaFianchi(entity.getCirconferenzaFianchi());
        dto.setCirconferenzaBraccio(entity.getCirconferenzaBraccio());
        dto.setCirconferenzaCoscia(entity.getCirconferenzaCoscia());
        dto.setNote(entity.getNote());
        return dto;
    }

    private void mapToEntity(MeasurementDto dto, Measurement entity, Patient patient) {
        entity.setPatient(patient);
        entity.setDataMisurazione(dto.getDataMisurazione());
        entity.setPeso(dto.getPeso());
        entity.setAltezza(dto.getAltezza());
        entity.setMassaGrassaPercentuale(dto.getMassaGrassaPercentuale());
        entity.setMassaMagraPercentuale(dto.getMassaMagraPercentuale());
        entity.setCirconferenzaVita(dto.getCirconferenzaVita());
        entity.setCirconferenzaFianchi(dto.getCirconferenzaFianchi());
        entity.setCirconferenzaBraccio(dto.getCirconferenzaBraccio());
        entity.setCirconferenzaCoscia(dto.getCirconferenzaCoscia());
        entity.setNote(dto.getNote());
    }
}