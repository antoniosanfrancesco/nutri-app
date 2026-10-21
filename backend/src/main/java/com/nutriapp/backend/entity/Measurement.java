package com.nutriapp.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "measurements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Measurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "data_misurazione", nullable = false)
    private LocalDate dataMisurazione;

    // --- Parametri Principali ---
    @Column(name = "peso_kg")
    private Double peso; // in kg

    @Column(name = "altezza_cm")
    private Double altezza; // in cm

    private Double bmi; // Indice di Massa Corporea (calcolato automaticamente)

    @Column(name = "massa_grassa_perc")
    private Double massaGrassaPercentuale; // %

    @Column(name = "massa_magra_perc")
    private Double massaMagraPercentuale; // %

    // --- Circonferenze (in cm) ---
    @Column(name = "circ_vita_cm")
    private Double circonferenzaVita;

    @Column(name = "circ_fianchi_cm")
    private Double circonferenzaFianchi;

    @Column(name = "circ_braccio_cm")
    private Double circonferenzaBraccio;

    @Column(name = "circ_coscia_cm")
    private Double circonferenzaCoscia;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (dataMisurazione == null) {
            dataMisurazione = LocalDate.now();
        }
        // Calcolo automatico del BMI se peso e altezza sono presenti
        if (peso != null && altezza != null && altezza > 0) {
            double altezzaInMetri = altezza / 100.0;
            this.bmi = Math.round((peso / (altezzaInMetri * altezzaInMetri)) * 10.0) / 10.0;
        }
    }
}