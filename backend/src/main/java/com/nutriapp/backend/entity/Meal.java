package com.nutriapp.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome; // Es. "Colazione", "Pranzo", "Cena"

    @Column(name = "orario_consigliato")
    private String orarioConsigliato; // Es. "08:00" oppure "Dopo l'allenamento"

    private Integer ordine; // Per ordinare i pasti nella giornata (1, 2, 3...)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_plan_id", nullable = false)
    private DailyPlan dailyPlan;

    @Builder.Default
    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20) // 🟢 Completa la catena @BatchSize per caricare in modo efficiente i singoli alimenti
    private List<MealItem> mealItems = new ArrayList<>();

    // Helper methods per la sincronizzazione bidirezionale
    public void addMealItem(MealItem item) {
        mealItems.add(item);
        item.setMeal(this);
    }

    public void removeMealItem(MealItem item) {
        mealItems.remove(item);
        item.setMeal(null);
    }
}