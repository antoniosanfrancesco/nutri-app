package com.nutriapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DietSummaryDto {

    private Long id;
    private String titolo;
		private String note;
    private LocalDate dataInizio;
    private LocalDate dataFine;
    private Boolean attiva;
    private Long patientId;
    private String patientNomeCompleto;
    private Double calorieTarget;
		private Double proteineTarget;
		private Double carboidratiTarget;
		private Double grassiTarget;
}