package com.nutriapp.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyPlanDto {

    private Long id;

    @NotBlank(message = "Il nome del giorno è obbligatorio (es. Lunedì, Giorno A)")
    private String nomeGiorno;

    private Integer ordine;

    @Valid
    private List<MealDto> meals = new ArrayList<>();

    // Totali nutrizionali della giornata
    private Double totaleCalorie = 0.0;
    private Double totaleProteine = 0.0;
    private Double totaleCarboidrati = 0.0;
    private Double totaleGrassi = 0.0;
    private Double totaleFibre = 0.0;
}