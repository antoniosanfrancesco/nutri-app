package com.nutriapp.backend.controller;

import com.nutriapp.backend.dto.MeasurementDto;
import com.nutriapp.backend.repository.UserRepository; // o NutritionistRepository
import com.nutriapp.backend.service.MeasurementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/measurements")
public class MeasurementController {

    private final MeasurementService measurementService;
    private final UserRepository userRepository; // 🟢 Iniettiamo il Repository per trovare l'ID reale

    public MeasurementController(MeasurementService measurementService, UserRepository userRepository) {
        this.measurementService = measurementService;
        this.userRepository = userRepository;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MeasurementDto>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(measurementService.getMeasurementsByPatient(patientId));
    }

    @GetMapping("/patient/{patientId}/latest")
    public ResponseEntity<MeasurementDto> getLatestByPatient(@PathVariable Long patientId) {
        MeasurementDto dto = measurementService.getLatestMeasurementByPatient(patientId);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<MeasurementDto> create(
            @RequestBody MeasurementDto dto,
            Authentication authentication
    ) {
        Long nutritionistId = getNutritionistIdFromAuth(authentication);
        return ResponseEntity.ok(measurementService.createMeasurement(dto, nutritionistId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeasurementDto> update(
            @PathVariable Long id,
            @RequestBody MeasurementDto dto,
            Authentication authentication
    ) {
        Long nutritionistId = getNutritionistIdFromAuth(authentication);
        return ResponseEntity.ok(measurementService.updateMeasurement(id, dto, nutritionistId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long nutritionistId = getNutritionistIdFromAuth(authentication);
        measurementService.deleteMeasurement(id, nutritionistId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Recupera l'ID del nutrizionista dal DB usando l'email presente nel token JWT
     */
    private Long getNutritionistIdFromAuth(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Utente non autenticato");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("Nutrizionista non trovato per l'email: " + email));
    }
}