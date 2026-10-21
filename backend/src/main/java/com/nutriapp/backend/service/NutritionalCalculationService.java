package com.nutriapp.backend.service;

import com.nutriapp.backend.dto.ActivityLevel;
import com.nutriapp.backend.dto.Goal;
import com.nutriapp.backend.dto.NutritionalTargetDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;

@Service
public class NutritionalCalculationService {

    /**
     * Formula di Mifflin-St Jeor:
     * Uomini: (10 * peso_kg) + (6.25 * altezza_cm) - (5 * eta) + 5
     * Donne:  (10 * peso_kg) + (6.25 * altezza_cm) - (5 * eta) - 161
     */
    public BigDecimal calculateBmrMifflinStJeor(BigDecimal pesoKg, BigDecimal altezzaCm, LocalDate dataNascita, String sesso) {
        int eta = calculateAge(dataNascita);

        double peso = pesoKg.doubleValue();
        double altezza = altezzaCm.doubleValue();

        double bmr = (10 * peso) + (6.25 * altezza) - (5 * eta);

        if ("M".equalsIgnoreCase(sesso)) {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        return BigDecimal.valueOf(bmr).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcola il TDEE (Total Daily Energy Expenditure)
     */
    public BigDecimal calculateTdee(BigDecimal bmr, ActivityLevel activityLevel) {
        double tdee = bmr.doubleValue() * activityLevel.getFactor();
        return BigDecimal.valueOf(tdee).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcola l'intero prospetto nutrizionale per il paziente
     */
    public NutritionalTargetDto calculateFullTarget(
            BigDecimal pesoKg,
            BigDecimal altezzaCm,
            LocalDate dataNascita,
            String sesso,
            ActivityLevel activityLevel,
            Goal goal
    ) {
        BigDecimal bmr = calculateBmrMifflinStJeor(pesoKg, altezzaCm, dataNascita, sesso);
        BigDecimal tdee = calculateTdee(bmr, activityLevel);

        double targetKcalValue = tdee.doubleValue() * goal.getMultiplier();
        BigDecimal targetKcal = BigDecimal.valueOf(targetKcalValue).setScale(2, RoundingMode.HALF_UP);

        // Ripartizione Standard: 20% Proteine, 50% Carboidrati, 30% Grassi
        // (1g Proteina = 4 kcal | 1g Carboidrato = 4 kcal | 1g Grasso = 9 kcal)
        double proteineKcal = targetKcalValue * 0.20;
        double carboidratiKcal = targetKcalValue * 0.50;
        double grassiKcal = targetKcalValue * 0.30;

        BigDecimal proteineG = BigDecimal.valueOf(proteineKcal / 4.0).setScale(1, RoundingMode.HALF_UP);
        BigDecimal carboidratiG = BigDecimal.valueOf(carboidratiKcal / 4.0).setScale(1, RoundingMode.HALF_UP);
        BigDecimal grassiG = BigDecimal.valueOf(grassiKcal / 9.0).setScale(1, RoundingMode.HALF_UP);

        return NutritionalTargetDto.builder()
                .bmr(bmr)
                .tdee(tdee)
                .targetKcal(targetKcal)
                .proteineG(proteineG)
                .carboidratiG(carboidratiG)
                .grassiG(grassiG)
                .build();
    }

    private int calculateAge(LocalDate dataNascita) {
        if (dataNascita == null) {
            return 30; // Età predefinita se non specificata
        }
        return Period.between(dataNascita, LocalDate.now()).getYears();
    }
}