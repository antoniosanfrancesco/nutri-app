package com.nutriapp.backend.dto;

import lombok.Getter;

@Getter
public enum Goal {
    WEIGHT_LOSS(0.80, "Dimagrimento (-20% kcal)"),
    MODERATE_WEIGHT_LOSS(0.85, "Dimagrimento Moderato (-15% kcal)"),
    MAINTENANCE(1.00, "Mantenimento"),
    MODERATE_WEIGHT_GAIN(1.10, "Aumento Massa Moderato (+10% kcal)"),
    WEIGHT_GAIN(1.15, "Aumento Massa (+15% kcal)");

    private final double multiplier;
    private final String description;

    Goal(double multiplier, String description) {
        this.multiplier = multiplier;
        this.description = description;
    }
}