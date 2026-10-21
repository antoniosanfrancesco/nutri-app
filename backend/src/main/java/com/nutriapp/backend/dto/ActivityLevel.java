package com.nutriapp.backend.dto;

import lombok.Getter;

@Getter 
public enum ActivityLevel {
	SEDENTARY(1.2, "Sedentario (poco o nessun esercizio"),
	LIGHTLY_ACTIVE(1.375, "Leggermente attivo (esercizio leggero 1-3 giorni alla settimana)"),
	MODERATELY_ACTIVE(1.55, "Moderatamente attivo (esercizio moderato 3-5 giorni/settimana)"),
	VERY_ACTIVE(1.725, "Molto attivo (eserizio intenso 6-7 giorni/settimana)"),
	EXTRA_ACTIVE(1.9, "Estremamente attivo (lavoro fisico pesante o allenamento doppio)");

	private final double factor;
	private final String description; 

	ActivityLevel(double factor, String description) {
		this.factor = factor;
		this.description = description;
	}
}