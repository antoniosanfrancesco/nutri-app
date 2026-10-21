package com.nutriapp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FoodDto {

    private Long id;

    @NotBlank(message = "Il nome dell'alimento è obbligatorio")
    private String nome;

    private String categoria;

    @NotNull(message = "Le calorie sono obbligatorie")
    @PositiveOrZero(message = "Le calorie devono essere un valore non negativo")
    private Double calorie;

    @NotNull(message = "Le proteine sono obbligatorie")
    @PositiveOrZero(message = "Le proteine devono essere un valore non negativo")
    private Double proteine;

    @NotNull(message = "I carboidrati sono obbligatori")
    @PositiveOrZero(message = "I carboidrati devono essere un valore non negativo")
    private Double carboidrati;

    @NotNull(message = "I grassi sono obbligatori")
    @PositiveOrZero(message = "I grassi devono essere un valore non negativo")
    private Double grassi;

    @PositiveOrZero(message = "Le fibre devono essere un valore non negativo")
    private Double fibre;

    private Boolean isCustom; // flag utile per il frontend per capire se è un alimento personale
}