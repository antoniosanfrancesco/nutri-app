package com.nutriapp.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionalTargetDto {
    private BigDecimal bmr;          // Kcal Metabolismo Basale
    private BigDecimal tdee;         // Kcal Mantenimento
    private BigDecimal targetKcal;   // Kcal Obiettivo (Aggiustate in base al Goal)

    // Macronutrienti consigliati in grammi
    private BigDecimal proteineG;
    private BigDecimal carboidratiG;
    private BigDecimal grassiG;
}