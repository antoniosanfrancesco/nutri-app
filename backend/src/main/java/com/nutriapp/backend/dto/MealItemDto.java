package com.nutriapp.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MealItemDto {

    private Long id;

    @NotNull(message = "L'alimento è obbligatorio")
    private Long foodId;

    private String foodNome;
    private String foodCategoria;

    @NotNull(message = "La quantità in grammi è obbligatoria")
    @Positive(message = "I grammi devono essere un valore positivo")
    private Double grammi;

    private String note;

    // Valori nutrizionali calcolati proporzionalmente alla quantità in grammi
    private Double calorie;
    private Double proteine;
    private Double carboidrati;
    private Double grassi;
    private Double fibre;
}