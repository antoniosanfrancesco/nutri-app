package com.nutriapp.backend.repository;

import com.nutriapp.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Recupera tutti i pazienti del nutrizionista autenticato
    List<Patient> findByNutritionistId(Long nutritionistId);

    // Ricerca per solo cognome
    List<Patient> findByNutritionistIdAndCognomeContainingIgnoreCase(Long nutritionistId, String cognome);

    // FONDAMENTALE PER LA SICUREZZA:
    // Garantisce che il paziente con 'id' appartenga davvero al nutrizionista loggato
    Optional<Patient> findByIdAndNutritionistId(Long id, Long nutritionistId);

    // Ricerca completa per nome O cognome (case-insensitive)
    @Query("SELECT p FROM Patient p WHERE p.nutritionist.id = :nutritionistId " +
           "AND (LOWER(p.nome) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.cognome) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Patient> searchPatientsByNutritionist(@Param("nutritionistId") Long nutritionistId, 
                                                @Param("query") String query);

    // Verifica presenza di duplicati per Codice Fiscale
    boolean existsByCodiceFiscaleAndNutritionistId(String codiceFiscale, Long nutritionistId);
}