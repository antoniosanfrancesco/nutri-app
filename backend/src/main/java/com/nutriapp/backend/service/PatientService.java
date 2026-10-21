package com.nutriapp.backend.service;

import com.nutriapp.backend.dto.PatientDto;
import com.nutriapp.backend.entity.Patient;
import com.nutriapp.backend.entity.User;
import com.nutriapp.backend.repository.PatientRepository;
import com.nutriapp.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    // --- READ ---

    @Transactional(readOnly = true)
    public List<PatientDto> getAllPatientsByNutritionist(Long nutritionistId) {
        return patientRepository.findByNutritionistId(nutritionistId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientDto getPatientByIdAndNutritionist(Long id, Long nutritionistId) {
        Patient patient = patientRepository.findByIdAndNutritionistId(id, nutritionistId)
                .orElseThrow(() -> new RuntimeException("Paziente non trovato o non autorizzato (ID: " + id + ")"));
        return mapToDto(patient);
    }

    @Transactional(readOnly = true)
    public List<PatientDto> searchPatients(Long nutritionistId, String query) {
        if (query == null || query.isBlank()) {
            return getAllPatientsByNutritionist(nutritionistId);
        }
        return patientRepository.searchPatientsByNutritionist(nutritionistId, query.trim())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // --- CREATE ---

    public PatientDto createPatient(PatientDto dto, Long nutritionistId) {
        User nutritionist = userRepository.findById(nutritionistId)
                .orElseThrow(() -> new RuntimeException("Nutrizionista non trovato (ID: " + nutritionistId + ")"));

        // Controllo facoltativo su codice fiscale duplicato per lo stesso nutrizionista
        if (dto.getCodiceFiscale() != null && !dto.getCodiceFiscale().isBlank()) {
            if (patientRepository.existsByCodiceFiscaleAndNutritionistId(dto.getCodiceFiscale(), nutritionistId)) {
                throw new IllegalArgumentException("Esiste già un paziente con questo Codice Fiscale.");
            }
        }

        Patient patient = mapToEntity(dto);
        patient.setNutritionist(nutritionist);

        Patient savedPatient = patientRepository.save(patient);
        return mapToDto(savedPatient);
    }

    // --- UPDATE ---

    public PatientDto updatePatient(Long id, PatientDto dto, Long nutritionistId) {
        Patient patient = patientRepository.findByIdAndNutritionistId(id, nutritionistId)
                .orElseThrow(() -> new RuntimeException("Paziente non trovato o non autorizzato (ID: " + id + ")"));

        patient.setNome(dto.getNome());
        patient.setCognome(dto.getCognome());
				patient.setEmail(dto.getEmail());
        patient.setCodiceFiscale(dto.getCodiceFiscale());
        patient.setDataNascita(dto.getDataNascita());
        patient.setSesso(dto.getSesso());
        patient.setTelefono(dto.getTelefono());
				patient.setPeso(dto.getPeso());
				patient.setAltezza(dto.getAltezza());
        patient.setNoteCliniche(dto.getNoteCliniche());

        Patient updatedPatient = patientRepository.save(patient);
        return mapToDto(updatedPatient);
    }

    // --- DELETE ---

    public void deletePatient(Long id, Long nutritionistId) {
        Patient patient = patientRepository.findByIdAndNutritionistId(id, nutritionistId)
                .orElseThrow(() -> new RuntimeException("Paziente non trovato o non autorizzato (ID: " + id + ")"));
        patientRepository.delete(patient);
    }

    // --- MAPPING HELPERS ---

    private PatientDto mapToDto(Patient patient) {
        PatientDto dto = new PatientDto();
        dto.setId(patient.getId());
        dto.setNutritionistId(patient.getNutritionist() != null ? patient.getNutritionist().getId() : null);
        dto.setNome(patient.getNome());
        dto.setCognome(patient.getCognome());
				dto.setEmail(patient.getEmail());
        dto.setCodiceFiscale(patient.getCodiceFiscale());
        dto.setDataNascita(patient.getDataNascita());
        dto.getSesso();
        dto.setSesso(patient.getSesso());
				dto.setPeso(patient.getPeso());
				dto.setAltezza(patient.getAltezza());
        dto.setTelefono(patient.getTelefono());
        dto.setNoteCliniche(patient.getNoteCliniche());
        dto.setCreatedAt(patient.getCreatedAt());
        return dto;
    }

    private Patient mapToEntity(PatientDto dto) {
        Patient patient = new Patient();
        patient.setNome(dto.getNome());
        patient.setCognome(dto.getCognome());
				patient.setEmail(dto.getEmail());
        patient.setCodiceFiscale(dto.getCodiceFiscale());
        patient.setDataNascita(dto.getDataNascita());
        patient.setSesso(dto.getSesso());
				patient.setPeso(dto.getPeso());
				patient.setAltezza(dto.getAltezza());
        patient.setTelefono(dto.getTelefono());
        patient.setNoteCliniche(dto.getNoteCliniche());
        return patient;
    }
}