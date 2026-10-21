package com.nutriapp.backend.controller;

import com.nutriapp.backend.dto.DietDto;
import com.nutriapp.backend.dto.DietSummaryDto;
import com.nutriapp.backend.entity.User;
import com.nutriapp.backend.repository.UserRepository;
import com.nutriapp.backend.service.DietService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/diets")
public class DietController {

    private final DietService dietService;
    private final UserRepository userRepository;

    public DietController(DietService dietService, UserRepository userRepository) {
        this.dietService = dietService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato: " + principal.getName()));
    }

    /**
     * POST /api/diets
     * Crea una nuova dieta per un paziente associato al nutrizionista autenticato.
     */
    @PostMapping
    public ResponseEntity<DietDto> createDiet(
            @Valid @RequestBody DietDto dietDto,
            Principal principal
    ) {
        User currentUser = getCurrentUser(principal);
        DietDto createdDiet = dietService.createDiet(dietDto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDiet);
    }

    /**
     * GET /api/diets/{id}
     * Recupera il dettaglio completo di una dieta.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DietDto> getDietById(
            @PathVariable Long id,
            Principal principal
    ) {
        User currentUser = getCurrentUser(principal);
        DietDto diet = dietService.getDietById(id, currentUser.getId());
        return ResponseEntity.ok(diet);
    }

    /**
     * GET /api/diets
     * Recupera la lista sintetica di tutte le diete gestite dal nutrizionista.
     */
    @GetMapping
    public ResponseEntity<List<DietSummaryDto>> getAllDiets(
            Principal principal
    ) {
        User currentUser = getCurrentUser(principal);
        List<DietSummaryDto> diets = dietService.getDietsByNutritionist(currentUser.getId());
        return ResponseEntity.ok(diets);
    }

    /**
     * GET /api/diets/patient/{patientId}
     * Recupera tutte le diete create per uno specifico paziente.
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DietSummaryDto>> getDietsByPatient(
            @PathVariable Long patientId,
            Principal principal
    ) {
        User currentUser = getCurrentUser(principal);
        List<DietSummaryDto> diets = dietService.getDietsByPatient(patientId, currentUser.getId());
        return ResponseEntity.ok(diets);
    }

    /**
     * PUT /api/diets/{id}
     * Aggiorna una dieta esistente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DietDto> updateDiet(
            @PathVariable Long id,
            @Valid @RequestBody DietDto dietDto,
            Principal principal
    ) {
        User currentUser = getCurrentUser(principal);
        DietDto updatedDiet = dietService.updateDiet(id, dietDto, currentUser.getId());
        return ResponseEntity.ok(updatedDiet);
    }

    /**
     * DELETE /api/diets/{id}
     * Elimina una dieta.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiet(
            @PathVariable Long id,
            Principal principal
    ) {
        User currentUser = getCurrentUser(principal);
        dietService.deleteDiet(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}