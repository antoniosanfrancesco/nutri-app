package com.nutriapp.backend.controller;

import com.nutriapp.backend.dto.FoodDto;
import com.nutriapp.backend.entity.User;
import com.nutriapp.backend.repository.UserRepository;
import com.nutriapp.backend.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.nutriapp.backend.dto.ExternalFoodDto;
import com.nutriapp.backend.service.OpenFoodFactsService; 

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    private final FoodService foodService;
    private final UserRepository userRepository;

    public FoodController(FoodService foodService, UserRepository userRepository) {
        this.foodService = foodService;
        this.userRepository = userRepository;
    }

    private Long getAuthenticatedNutritionistId(Authentication authentication) {
        String email = authentication.getName();
        User nutritionist = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nutrizionista non trovato per l'email: " + email));
        return nutritionist.getId();
    }

    // GET /api/foods
    @GetMapping
    public ResponseEntity<List<FoodDto>> getAllFoods(Authentication authentication) {
        // Se l'utente non è autenticato o la chiamata è pubblica, authentication sarà null
        String userEmail = (authentication != null && authentication.isAuthenticated()) 
                ? authentication.getName() 
                : null;

        List<FoodDto> foods = foodService.getAllFoods(userEmail);
        return ResponseEntity.ok(foods);
    }

    // GET /api/foods/{id}
    @GetMapping("/{id}")
    public ResponseEntity<FoodDto> getFoodById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        return ResponseEntity.ok(foodService.getFoodById(id, nutritionistId));
    }

    // POST /api/foods (crea un alimento personalizzato)
    @PostMapping
    public ResponseEntity<FoodDto> createCustomFood(
            @Valid @RequestBody FoodDto dto,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        FoodDto created = foodService.createCustomFood(dto, nutritionistId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/foods/{id} (modifica solo i propri alimenti personalizzati)
    @PutMapping("/{id}")
    public ResponseEntity<FoodDto> updateCustomFood(
            @PathVariable Long id,
            @Valid @RequestBody FoodDto dto,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        FoodDto updated = foodService.updateCustomFood(id, dto, nutritionistId);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/foods/{id} (elimina solo i propri alimenti personalizzati)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomFood(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long nutritionistId = getAuthenticatedNutritionistId(authentication);
        foodService.deleteCustomFood(id, nutritionistId);
        return ResponseEntity.noContent().build();
    }

		// Nel tuo FoodController.java
		@Autowired
		private OpenFoodFactsService openFoodFactsService;

		@GetMapping("/external-search")
		public ResponseEntity<List<ExternalFoodDto>> searchExternalFood(@RequestParam String query) {
				List<ExternalFoodDto> results = openFoodFactsService.searchFood(query);
				return ResponseEntity.ok(results);
		}
}