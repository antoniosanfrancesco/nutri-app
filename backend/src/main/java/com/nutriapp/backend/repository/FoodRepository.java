package com.nutriapp.backend.repository;

import com.nutriapp.backend.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

    // 1. Restituisce solo i cibi di base di sistema (nutritionist_id IS NULL)
    List<Food> findByNutritionistIsNull();

    // 2. Restituisce i cibi di base di sistema + i cibi personalizzati del nutrizionista loggato
    @Query("SELECT f FROM Food f WHERE f.nutritionist IS NULL OR f.nutritionist.email = :email")
    List<Food> findSystemAndCustomFoods(@Param("email") String email);

    // 3. Trova un cibo per ID solo se è di sistema oppure appartiene al nutrizionista loggato
    @Query("SELECT f FROM Food f WHERE f.id = :id AND (f.nutritionist IS NULL OR f.nutritionist.id = :nutritionistId)")
    Optional<Food> findByIdAndAvailableForNutritionist(@Param("id") Long id, @Param("nutritionistId") Long nutritionistId);
}