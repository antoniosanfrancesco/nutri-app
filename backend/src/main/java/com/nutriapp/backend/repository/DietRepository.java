package com.nutriapp.backend.repository;

import com.nutriapp.backend.entity.Diet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DietRepository extends JpaRepository<Diet, Long> {

    // Lista di tutte le diete create dal nutrizionista loggato
    List<Diet> findByNutritionistId(Long nutritionistId);

    // Lista di tutte le diete assegnate a uno specifico paziente
    List<Diet> findByPatientIdAndNutritionistId(Long patientId, Long nutritionistId);

    // Lista dei template / diete base (diete non ancora assegnate a un paziente specifico)
    List<Diet> findByNutritionistIdAndPatientIsNull(Long nutritionistId);

    // Recupera una singola dieta verificando la proprietà del nutrizionista
    Optional<Diet> findByIdAndNutritionistId(Long id, Long nutritionistId);

    // Trova la dieta attualmente attiva per un determinato paziente
    Optional<Diet> findByPatientIdAndNutritionistIdAndAttivaTrue(Long patientId, Long nutritionistId);

    // 🟢 Ora che abbiamo configurato @BatchSize sulle entità (Diet, DailyPlan, Meal),
    // non serve più il deep @EntityGraph o i JOIN FETCH multilivello: Hibernate caricherà
    // l'intero albero delle relazioni in batch in modo pulito ed esente da errori di fetch.
    @Query("SELECT d FROM Diet d WHERE d.id = :id AND d.nutritionist.id = :nutritionistId")
    Optional<Diet> findByIdWithFullDetails(@Param("id") Long id, @Param("nutritionistId") Long nutritionistId);
}