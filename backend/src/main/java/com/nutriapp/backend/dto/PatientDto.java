package com.nutriapp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {

    private Long id;
    private Long nutritionistId;

    @NotBlank(message = "Il nome è obbligatorio")
    private String nome;

    @NotBlank(message = "Il cognome è obbligatorio")
    private String cognome;

		@Email(message = "L'email deve essere valida")
    private String email;

    @Size(max = 16, message = "Il codice fiscale non può superare i 16 caratteri")
    private String codiceFiscale;

    private LocalDate dataNascita;

    @Pattern(regexp = "^[MF]$", message = "Il sesso deve essere 'M' o 'F'")
    private String sesso;

    private String telefono;

		private Double peso;

		private Double altezza;

    private String noteCliniche;

    private LocalDateTime createdAt;
}