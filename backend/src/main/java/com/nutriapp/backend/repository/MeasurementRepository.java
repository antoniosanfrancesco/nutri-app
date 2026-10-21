package com.nutriapp.backend.repository;

import com.nutriapp.backend.entity.Measurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeasurementRepository extends JpaRepository<Measurement, Long> {

    // Recupera lo storico di tutte le misurazioni di un paziente ordinate dalla più recente
    List<Measurement> findByPatientIdOrderByDataMisurazioneDesc(Long patientId);

    // Recupera l'ultima misurazione effettuata per un determinato paziente
    Optional<Measurement> findTopByPatientIdOrderByDataMisurazioneDesc(Long patientId);

    // Verifica che la misurazione appartenga a un paziente gestito dal nutrizionista loggato
    Optional<Measurement> findByIdAndPatientNutritionistId(Long id, Long nutritionistId);
}