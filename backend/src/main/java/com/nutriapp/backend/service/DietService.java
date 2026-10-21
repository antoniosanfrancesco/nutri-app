package com.nutriapp.backend.service;

import com.nutriapp.backend.dto.*;
import com.nutriapp.backend.entity.*;
import com.nutriapp.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional
public class DietService {

    private final DietRepository dietRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final FoodRepository foodRepository;

    public DietService(
            DietRepository dietRepository,
            PatientRepository patientRepository,
            UserRepository userRepository,
            FoodRepository foodRepository
    ) {
        this.dietRepository = dietRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.foodRepository = foodRepository;
    }

    // --- CREATE ---

    public DietDto createDiet(DietDto dto, Long nutritionistId) {
        User nutritionist = userRepository.findById(nutritionistId)
                .orElseThrow(() -> new RuntimeException("Nutrizionista non trovato (ID: " + nutritionistId + ")"));

        Patient patient = null;
        if (dto.getPatientId() != null) {
            patient = patientRepository.findByIdAndNutritionistId(dto.getPatientId(), nutritionistId)
                    .orElseThrow(() -> new RuntimeException("Paziente non trovato o non associato a questo nutrizionista"));

            // Se la dieta è attiva ed è associata a un paziente, disattiva le sue precedenti
            if (Boolean.TRUE.equals(dto.getAttiva())) {
                deactivateExistingDiets(patient.getId(), nutritionistId);
            }
        }

        Diet diet = mapToEntity(dto, nutritionist, patient);
        Diet savedDiet = dietRepository.save(diet);

        return mapToDtoWithCalculations(savedDiet);
    }

    // --- READ ---

    @Transactional(readOnly = true)
    public DietDto getDietById(Long id, Long nutritionistId) {
        Diet diet = dietRepository.findByIdWithFullDetails(id, nutritionistId)
                .orElseThrow(() -> new RuntimeException("Dieta non trovata o non accessibile (ID: " + id + ")"));

        return mapToDtoWithCalculations(diet);
    }

    @Transactional(readOnly = true)
    public List<DietSummaryDto> getDietsByNutritionist(Long nutritionistId) {
        return dietRepository.findByNutritionistId(nutritionistId)
                .stream()
                .map(this::mapToSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DietSummaryDto> getDietsByPatient(Long patientId, Long nutritionistId) {
        return dietRepository.findByPatientIdAndNutritionistId(patientId, nutritionistId)
                .stream()
                .map(this::mapToSummaryDto)
                .toList();
    }

    // --- UPDATE ---

    public DietDto updateDiet(Long id, DietDto dto, Long nutritionistId) {
        Diet existingDiet = dietRepository.findById(id)
                .filter(d -> d.getNutritionist().getId().equals(nutritionistId))
                .orElseThrow(() -> new RuntimeException("Dieta non trovata o non modificabile"));

        // Gestione cambio o associazione Paziente
        Patient patient = null;
        if (dto.getPatientId() != null) {
            patient = patientRepository.findByIdAndNutritionistId(dto.getPatientId(), nutritionistId)
                    .orElseThrow(() -> new RuntimeException("Paziente non trovato o non associato a questo nutrizionista"));

            if (Boolean.TRUE.equals(dto.getAttiva()) && patient.getId() != null) {
                deactivateExistingDiets(patient.getId(), nutritionistId);
            }
        }

        existingDiet.setPatient(patient);
        existingDiet.setTitolo(dto.getTitolo());
        existingDiet.setNote(dto.getNote());
        existingDiet.setDataInizio(dto.getDataInizio());
        existingDiet.setDataFine(dto.getDataFine());
        existingDiet.setCalorieTarget(dto.getCalorieTarget());
        existingDiet.setProteineTarget(dto.getProteineTarget());
        existingDiet.setCarboidratiTarget(dto.getCarboidratiTarget());
        existingDiet.setGrassiTarget(dto.getGrassiTarget());
        existingDiet.setAttiva(dto.getAttiva() != null ? dto.getAttiva() : true);

        // Svuota l'albero precedente e ricostruisce i piani giornalieri
        existingDiet.getDailyPlans().clear();

        if (dto.getDailyPlans() != null) {
            for (DailyPlanDto planDto : dto.getDailyPlans()) {
                DailyPlan plan = mapDailyPlanEntity(planDto, existingDiet);
                existingDiet.addDailyPlan(plan);
            }
        }

        Diet updatedDiet = dietRepository.save(existingDiet);
        return mapToDtoWithCalculations(updatedDiet);
    }

    // --- DELETE ---

    public void deleteDiet(Long id, Long nutritionistId) {
        Diet diet = dietRepository.findByIdAndNutritionistId(id, nutritionistId)
                .orElseThrow(() -> new RuntimeException("Dieta non trovata o non eliminabile"));

        dietRepository.delete(diet);
    }

    // --- HELPER METODI E CALCOLI NUTRIZIONALI ---

    private void deactivateExistingDiets(Long patientId, Long nutritionistId) {
        if (patientId == null) return;
        dietRepository.findByPatientIdAndNutritionistIdAndAttivaTrue(patientId, nutritionistId)
                .ifPresent(diet -> {
                    diet.setAttiva(false);
                    dietRepository.save(diet);
                });
    }

    private Diet mapToEntity(DietDto dto, User nutritionist, Patient patient) {
        Diet diet = new Diet();
        diet.setTitolo(dto.getTitolo());
        diet.setNote(dto.getNote());
        diet.setDataInizio(dto.getDataInizio());
        diet.setDataFine(dto.getDataFine());
        diet.setCalorieTarget(dto.getCalorieTarget());
        diet.setProteineTarget(dto.getProteineTarget());
        diet.setCarboidratiTarget(dto.getCarboidratiTarget());
        diet.setGrassiTarget(dto.getGrassiTarget());
        diet.setAttiva(dto.getAttiva() != null ? dto.getAttiva() : true);
        diet.setNutritionist(nutritionist);
        diet.setPatient(patient);

        if (dto.getDailyPlans() != null) {
            for (DailyPlanDto planDto : dto.getDailyPlans()) {
                DailyPlan plan = mapDailyPlanEntity(planDto, diet);
                diet.addDailyPlan(plan);
            }
        }

        return diet;
    }

    private DailyPlan mapDailyPlanEntity(DailyPlanDto planDto, Diet diet) {
        DailyPlan plan = new DailyPlan();
        plan.setNomeGiorno(planDto.getNomeGiorno());
        plan.setOrdine(planDto.getOrdine());
        plan.setDiet(diet);

        if (planDto.getMeals() != null) {
            for (MealDto mealDto : planDto.getMeals()) {
                Meal meal = mapMealEntity(mealDto, plan);
                plan.addMeal(meal);
            }
        }

        return plan;
    }

    private Meal mapMealEntity(MealDto mealDto, DailyPlan plan) {
        Meal meal = new Meal();
        meal.setNome(mealDto.getNome());
        meal.setOrarioConsigliato(mealDto.getOrarioConsigliato());
        meal.setOrdine(mealDto.getOrdine());
        meal.setDailyPlan(plan);

        if (mealDto.getMealItems() != null) {
            for (MealItemDto itemDto : mealDto.getMealItems()) {
                Food food = foodRepository.findById(itemDto.getFoodId())
                        .orElseThrow(() -> new RuntimeException("Alimento non trovato (ID: " + itemDto.getFoodId() + ")"));

                MealItem item = new MealItem();
                item.setGrammi(itemDto.getGrammi());
                item.setNote(itemDto.getNote());
                item.setFood(food);
                meal.addMealItem(item);
            }
        }

        return meal;
    }

    // Mapping Entity -> DTO con calcolo dinamico dei valori nutrizionali
    private DietDto mapToDtoWithCalculations(Diet diet) {
        DietDto dto = new DietDto();
        dto.setId(diet.getId());
        dto.setTitolo(diet.getTitolo());
        dto.setNote(diet.getNote());
        dto.setDataInizio(diet.getDataInizio());
        dto.setDataFine(diet.getDataFine());
        dto.setCalorieTarget(diet.getCalorieTarget());
        dto.setProteineTarget(diet.getProteineTarget());
        dto.setCarboidratiTarget(diet.getCarboidratiTarget());
        dto.setGrassiTarget(diet.getGrassiTarget());
        dto.setAttiva(diet.getAttiva());

        if (diet.getPatient() != null) {
            dto.setPatientId(diet.getPatient().getId());
            dto.setPatientNome(diet.getPatient().getNome());
            dto.setPatientCognome(diet.getPatient().getCognome());
        }

        if (diet.getDailyPlans() != null) {
            for (DailyPlan dp : diet.getDailyPlans()) {
                DailyPlanDto dpDto = mapDailyPlanDtoWithCalculations(dp);
                dto.getDailyPlans().add(dpDto);
            }
        }

        return dto;
    }

    private DailyPlanDto mapDailyPlanDtoWithCalculations(DailyPlan dp) {
        DailyPlanDto dpDto = new DailyPlanDto();
        dpDto.setId(dp.getId());
        dpDto.setNomeGiorno(dp.getNomeGiorno());
        dpDto.setOrdine(dp.getOrdine());

        double totalCal = 0, totalProt = 0, totalCarb = 0, totalFat = 0, totalFib = 0;

        if (dp.getMeals() != null) {
            for (Meal meal : dp.getMeals()) {
                MealDto mealDto = mapMealDtoWithCalculations(meal);
                dpDto.getMeals().add(mealDto);

                totalCal += mealDto.getTotaleCalorie();
                totalProt += mealDto.getTotaleProteine();
                totalCarb += mealDto.getTotaleCarboidrati();
                totalFat += mealDto.getTotaleGrassi();
                totalFib += mealDto.getTotaleFibre();
            }
        }

        dpDto.setTotaleCalorie(round(totalCal));
        dpDto.setTotaleProteine(round(totalProt));
        dpDto.setTotaleCarboidrati(round(totalCarb));
        dpDto.setTotaleGrassi(round(totalFat));
        dpDto.setTotaleFibre(round(totalFib));

        return dpDto;
    }

    private MealDto mapMealDtoWithCalculations(Meal meal) {
        MealDto mealDto = new MealDto();
        mealDto.setId(meal.getId());
        mealDto.setNome(meal.getNome());
        mealDto.setOrarioConsigliato(meal.getOrarioConsigliato());
        mealDto.setOrdine(meal.getOrdine());

        double totalCal = 0, totalProt = 0, totalCarb = 0, totalFat = 0, totalFib = 0;

        if (meal.getMealItems() != null) {
            for (MealItem item : meal.getMealItems()) {
                MealItemDto itemDto = mapMealItemDtoWithCalculations(item);
                mealDto.getMealItems().add(itemDto);

                totalCal += itemDto.getCalorie();
                totalProt += itemDto.getProteine();
                totalCarb += itemDto.getCarboidrati();
                totalFat += itemDto.getGrassi();
                totalFib += itemDto.getFibre();
            }
        }

        mealDto.setTotaleCalorie(round(totalCal));
        mealDto.setTotaleProteine(round(totalProt));
        mealDto.setTotaleCarboidrati(round(totalCarb));
        mealDto.setTotaleGrassi(round(totalFat));
        mealDto.setTotaleFibre(round(totalFib));

        return mealDto;
    }

    private MealItemDto mapMealItemDtoWithCalculations(MealItem item) {
        MealItemDto itemDto = new MealItemDto();
        itemDto.setId(item.getId());
        itemDto.setGrammi(item.getGrammi());
        itemDto.setNote(item.getNote());

        Food food = item.getFood();
        if (food != null) {
            itemDto.setFoodId(food.getId());
            itemDto.setFoodNome(food.getNome());
            itemDto.setFoodCategoria(food.getCategoria());

            double ratio = item.getGrammi() / 100.0;
            itemDto.setCalorie(round(food.getCalorie() != null ? food.getCalorie() * ratio : 0.0));
            itemDto.setProteine(round(food.getProteine() != null ? food.getProteine() * ratio : 0.0));
            itemDto.setCarboidrati(round(food.getCarboidrati() != null ? food.getCarboidrati() * ratio : 0.0));
            itemDto.setGrassi(round(food.getGrassi() != null ? food.getGrassi() * ratio : 0.0));
            itemDto.setFibre(round(food.getFibre() != null ? food.getFibre() * ratio : 0.0));
        }

        return itemDto;
    }

    private DietSummaryDto mapToSummaryDto(Diet diet) {
        String patientFullName = (diet.getPatient() != null) 
                ? diet.getPatient().getNome() + " " + diet.getPatient().getCognome() 
                : "Dieta Base (Template)";

        return new DietSummaryDto(
                diet.getId(),
                diet.getTitolo(),
                diet.getNote(),
                diet.getDataInizio(),
                diet.getDataFine(),
                diet.getAttiva(),
                diet.getPatient() != null ? diet.getPatient().getId() : null,
                patientFullName,
                diet.getCalorieTarget(),
                diet.getProteineTarget(),
                diet.getCarboidratiTarget(),
                diet.getGrassiTarget()
        );
    }

    private double round(double value) {
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }
}