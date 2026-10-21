package com.nutriapp.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DietDto {

    private Long id;

    @NotBlank(message = "Il titolo della dieta è obbligatorio")
    private String titolo;

    private String note;
    private LocalDate dataInizio;
    private LocalDate dataFine;

    // Macro-target impostati dal nutrizionista
    private Double calorieTarget;
    private Double proteineTarget;
    private Double carboidratiTarget;
    private Double grassiTarget;

    private Boolean attiva = true;

    @NotNull(message = "Il paziente è obbligatorio")
    private Long patientId;
    private String patientNome;
    private String patientCognome;

    @Valid
    private List<DailyPlanDto> dailyPlans = new ArrayList<>();
}