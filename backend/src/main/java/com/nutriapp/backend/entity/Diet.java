package com.nutriapp.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "diets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Diet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titolo;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "data_inizio")
    private LocalDate dataInizio;

    @Column(name = "data_fine")
    private LocalDate dataFine;

    // --- Macro-target giornalieri unificati ---
    @Column(name = "calorie_target")
    private Double calorieTarget;

    @Column(name = "proteine_target")
    private Double proteineTarget;

    @Column(name = "carboidrati_target")
    private Double carboidratiTarget;

    @Column(name = "grassi_target")
    private Double grassiTarget;

    @Builder.Default
    @Column(nullable = false)
    private Boolean attiva = true;

    // Reso nullable = true per permettere la creazione di Diete Base / Template (non assegnate a un paziente)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = true)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutritionist_id", nullable = false)
    private User nutritionist;

    @Builder.Default
    @OneToMany(mappedBy = "diet", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20) // 🟢 Risolve definitivamente l'errore di Fetch / MultipleBagFetchException
    private List<DailyPlan> dailyPlans = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (attiva == null) {
            attiva = true;
        }
    }

    // Helper methods per la sincronizzazione della relazione bidirezionale
    public void addDailyPlan(DailyPlan plan) {
        dailyPlans.add(plan);
        plan.setDiet(this);
    }

    public void removeDailyPlan(DailyPlan plan) {
        dailyPlans.remove(plan);
        plan.setDiet(null);
    }
}