package com.nutriapp.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "daily_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_giorno", nullable = false)
    private String nomeGiorno; // Es. "Lunedì", "Giorno Tipo A"

    private Integer ordine; // Per ordinare i giorni nell'interfaccia (1, 2, 3...)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diet_id", nullable = false)
    private Diet diet;

    @Builder.Default
    @OneToMany(mappedBy = "dailyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20) // 🟢 Previene errori di fetch e ottimizza il caricamento dei pasti
    private List<Meal> meals = new ArrayList<>();

    // Helper methods per la sincronizzazione bidirezionale
    public void addMeal(Meal meal) {
        meals.add(meal);
        meal.setDailyPlan(this);
    }

    public void removeMeal(Meal meal) {
        meals.remove(meal);
        meal.setDailyPlan(null);
    }
}