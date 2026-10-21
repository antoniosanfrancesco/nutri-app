package com.nutriapp.backend.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeasurementDto {

    private Long id;
    private Long patientId;
    private LocalDate dataMisurazione;

    // --- Parametri Principali ---
    private Double peso;
    private Double altezza;
    private Double bmi;
    private Double massaGrassaPercentuale;
    private Double massaMagraPercentuale;

    // --- Circonferenze (in cm) ---
    private Double circonferenzaVita;
    private Double circonferenzaFianchi;
    private Double circonferenzaBraccio;
    private Double circonferenzaCoscia;

    private String note;
}