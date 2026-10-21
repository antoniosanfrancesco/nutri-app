package com.nutriapp.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "foods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String categoria;

    // Valori nutrizionali riferiti solitamente a 100g / 100ml di prodotto
    private Double calorie;
    private Double proteine;
    private Double carboidrati;
    private Double grassi;
    private Double fibre;

    // Se nutritionist è NULL, l'alimento fa parte del database globale/di sistema.
    // Se valorizzato, indica un alimento personalizzato creato dal singolo nutrizionista.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutritionist_id", nullable = true)
    private User nutritionist;
}