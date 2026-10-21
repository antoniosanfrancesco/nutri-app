//contiene l'anagrafica del paziente 
package com.nutriapp.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutritionist_id", nullable = false)
    private User nutritionist;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cognome;

		@Column(name = "email")
		private String email;

    @Column(name = "codice_fiscale", length = 16)
    private String codiceFiscale;

    @Column(name = "data_nascita")
    private LocalDate dataNascita;

    @Column(length = 1)
    private String sesso;

    private String telefono;

		@Column(name = "peso")
		private Double peso;

		@Column(name = "altezza")
		private Double altezza;

    @Column(name = "note_cliniche", columnDefinition = "TEXT")
    private String noteCliniche;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

		// relazione bidirezionale con diet
		@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
		private List<Diet> diets = new ArrayList<>();

		// relazione bidirezionale con measurements
		@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
		private List<Measurement> measurements = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}