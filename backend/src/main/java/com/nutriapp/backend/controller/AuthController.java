package com.nutriapp.backend.controller;

import com.nutriapp.backend.dto.AuthDto.*;
import com.nutriapp.backend.entity.User;
import com.nutriapp.backend.repository.UserRepository;
import com.nutriapp.backend.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email già in uso.");
        }

        User user = new User();
        user.setNome(request.getNome());
        user.setCognome(request.getCognome());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Il ruolo di default ("ROLE_NUTRITIONIST") viene impostato automaticamente dall'Entity

        userRepository.save(user);

        //Passiamo sia l'email che il ruolo al generatore di token
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        //Recuperiamo l'utente dal database per estrarre il suo ruolo
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        //Passiamo sia l'email che il ruolo al generatore di token
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token));
    }

		@GetMapping("/me")
		public ResponseEntity<?> getCurrentUser() {
				// Prende l'email (subject) dell'utente autenticato dal token JWT
				Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
				
				if (authentication == null || !authentication.isAuthenticated()) {
						return ResponseEntity.status(401).body("Utente non autenticato");
				}

				String email = authentication.getName();

				// Recupera l'utente dal database
				User user = userRepository.findByEmail(email)
								.orElseThrow(() -> new RuntimeException("Utente non trovato"));

				// Puoi restituire l'utente (assicurati di non esporre la password nel JSON, es. con un DTO o nascondendola)
				return ResponseEntity.ok(user);
		}
}