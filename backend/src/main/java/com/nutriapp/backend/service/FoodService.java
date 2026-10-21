package com.nutriapp.backend.service;

import com.nutriapp.backend.dto.FoodDto;
import com.nutriapp.backend.entity.Food;
import com.nutriapp.backend.entity.User;
import com.nutriapp.backend.repository.FoodRepository;
import com.nutriapp.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FoodService {

    private final FoodRepository foodRepository;
    private final UserRepository userRepository;

    public FoodService(FoodRepository foodRepository, UserRepository userRepository) {
        this.foodRepository = foodRepository;
        this.userRepository = userRepository;
    }

    // --- READ ---

    @Transactional(readOnly = true)
    public List<FoodDto> getAllFoods(String userEmail) {
        if (userEmail == null) {
            // Restituisce solo i cibi di base visibili a tutti
            return foodRepository.findByNutritionistIsNull()
                    .stream()
                    .map(this::mapToDto) // Corretto convertToDTO -> mapToDto
                    .toList();
        }
        
        // Se l'utente è autenticato, restituisce sia i cibi di base sia i suoi personalizzati
        return foodRepository.findSystemAndCustomFoods(userEmail)
                .stream()
                .map(this::mapToDto) // Corretto convertToDTO -> mapToDto
                .toList();
    }

    @Transactional(readOnly = true)
    public FoodDto getFoodById(Long id, Long nutritionistId) {
        Food food = foodRepository.findByIdAndAvailableForNutritionist(id, nutritionistId)
                .orElseThrow(() -> new RuntimeException("Alimento non trovato o non accessibile (ID: " + id + ")"));

        return mapToDto(food);
    }

    // --- CREATE (Alimento personalizzato) ---

    public FoodDto createCustomFood(FoodDto dto, Long nutritionistId) {
        User nutritionist = userRepository.findById(nutritionistId)
                .orElseThrow(() -> new RuntimeException("Nutrizionista non trovato (ID: " + nutritionistId + ")"));

        Food food = mapToEntity(dto);
        food.setNutritionist(nutritionist); // Collega l'alimento al nutrizionista loggato

        Food saved = foodRepository.save(food);
        return mapToDto(saved);
    }

    // --- UPDATE (Solo alimenti personalizzati dell'utente) ---

    public FoodDto updateCustomFood(Long id, FoodDto dto, Long nutritionistId) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alimento non trovato (ID: " + id + ")"));

        // Impedisce la modifica di alimenti di sistema (nutritionist == null) o di altri utenti
        if (food.getNutritionist() == null || !food.getNutritionist().getId().equals(nutritionistId)) {
            throw new RuntimeException("Non sei autorizzato a modificare questo alimento");
        }

        food.setNome(dto.getNome());
        food.setCategoria(dto.getCategoria());
        food.setCalorie(dto.getCalorie());
        food.setProteine(dto.getProteine());
        food.setCarboidrati(dto.getCarboidrati());
        food.setGrassi(dto.getGrassi());
        food.setFibre(dto.getFibre());

        Food updated = foodRepository.save(food);
        return mapToDto(updated);
    }

    // --- DELETE (Solo alimenti personalizzati dell'utente) ---

    public void deleteCustomFood(Long id, Long nutritionistId) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alimento non trovato (ID: " + id + ")"));

        if (food.getNutritionist() == null || !food.getNutritionist().getId().equals(nutritionistId)) {
            throw new RuntimeException("Non sei autorizzato a eliminare questo alimento");
        }

        foodRepository.delete(food);
    }

    // --- MAPPING HELPERS ---

    private FoodDto mapToDto(Food food) {
        FoodDto dto = new FoodDto();
        dto.setId(food.getId());
        dto.setNome(food.getNome());
        dto.setCategoria(food.getCategoria());
        dto.setCalorie(food.getCalorie());
        dto.setProteine(food.getProteine());
        dto.setCarboidrati(food.getCarboidrati());
        dto.setGrassi(food.getGrassi());
        dto.setFibre(food.getFibre());
        dto.setIsCustom(food.getNutritionist() != null);
        return dto;
    }

    private Food mapToEntity(FoodDto dto) {
        Food food = new Food();
        food.setNome(dto.getNome());
        food.setCategoria(dto.getCategoria());
        food.setCalorie(dto.getCalorie());
        food.setProteine(dto.getProteine());
        food.setCarboidrati(dto.getCarboidrati());
        food.setGrassi(dto.getGrassi());
        food.setFibre(dto.getFibre());
        return food;
    }
}