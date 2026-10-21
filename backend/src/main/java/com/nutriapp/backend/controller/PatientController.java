package com.nutriapp.backend.controller;

import com.nutriapp.backend.dto.PatientDto;
import com.nutriapp.backend.entity.User;
import com.nutriapp.backend.repository.UserRepository;
import com.nutriapp.backend.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;
    private final UserRepository userRepository;

    public PatientController(PatientService patientService, UserRepository userRepository) {
        this.patientService = patientService;
        this.userRepository = userRepository;
    }

    // Ricava in modo sicuro l'ID del nutrizionista dal token JWT
    private Long getAuthenticatedNutritionistId(Authentication authentication) {
        String email = authentication.getName();
        User nutritionist = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nutrizionista non trovato per l'email: " + email));
        return nutritionist.getId();
    }

    // GET /api/patients  oppure  GET /api/patients?search=Rossi
    @GetMapping
    public ResponseEntity<List<PatientDto>> getAllPatients(
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(patientService.searchPatients(nutritionistId, search));
        }
        return ResponseEntity.ok(patientService.getAllPatientsByNutritionist(nutritionistId));
    }

    // GET /api/patients/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getPatientById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        return ResponseEntity.ok(patientService.getPatientByIdAndNutritionist(id, nutritionistId));
    }

    // POST /api/patients
    @PostMapping
    public ResponseEntity<PatientDto> createPatient(
            @Valid @RequestBody PatientDto dto,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        PatientDto createdPatient = patientService.createPatient(dto, nutritionistId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPatient);
    }

    // PUT /api/patients/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PatientDto> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientDto dto,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        PatientDto updatedPatient = patientService.updatePatient(id, dto, nutritionistId);
        return ResponseEntity.ok(updatedPatient);
    }

    // DELETE /api/patients/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        patientService.deletePatient(id, nutritionistId);
        return ResponseEntity.noContent().build();
    }
}