package com.nutriapp.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "meal_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double grammi; // Quantità in grammi o millilitri

    @Column(columnDefinition = "TEXT")
    private String note; // Es. "In alternativa 200g di yogurt greco"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @ManyToOne(fetch = FetchType.EAGER) // Ottimo per recuperare subito nome e valori nutrizionali dell'alimento
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;
}