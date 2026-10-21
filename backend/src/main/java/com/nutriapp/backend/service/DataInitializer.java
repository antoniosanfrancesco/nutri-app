package com.nutriapp.backend.config;

import com.nutriapp.backend.entity.Food;
import com.nutriapp.backend.entity.Patient;
import com.nutriapp.backend.entity.User;
import com.nutriapp.backend.repository.FoodRepository;
import com.nutriapp.backend.repository.PatientRepository;
import com.nutriapp.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("!test") // Evita l'esecuzione durante i test automatizzati
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final FoodRepository foodRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            PatientRepository patientRepository,
            FoodRepository foodRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.foodRepository = foodRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Popola il DB solo se vuoto per evitare duplicati ad ogni riavvio del server
        if (userRepository.count() == 0) {
            initData();
        }
    }

    private void initData() {
        // 1. Nutrizionista di test
        User nutritionist = new User();
        nutritionist.setEmail("nutrizionista@nutriapp.com");
        nutritionist.setPassword(passwordEncoder.encode("Password123!"));
        nutritionist.setNome("Mario");
        nutritionist.setCognome("Rossi");
        User savedNutritionist = userRepository.save(nutritionist);

        // 2. Creazione Paziente 1
        Patient p1 = new Patient();
        p1.setNutritionist(savedNutritionist); // Utilizza l'istanza salvata 'savedNutritionist'
        p1.setNome("Marco");
        p1.setCognome("Bianchi");
        p1.setCodiceFiscale("BNCMRC85M01H501Z");
        p1.setDataNascita(LocalDate.of(1985, 8, 1));
        p1.setSesso("M");
        p1.setTelefono("3331234567");
        p1.setNoteCliniche("Intollerante al lattosio, obiettivo perdita peso");

        // Creazione Paziente 2
        Patient p2 = new Patient();
        p2.setNutritionist(savedNutritionist);
        p2.setNome("Laura");
        p2.setCognome("Verdi");
        p2.setCodiceFiscale("VRDLRA90L41F205Y");
        p2.setDataNascita(LocalDate.of(1990, 7, 1));
        p2.setSesso("F");
        p2.setTelefono("3399876543");
        p2.setNoteCliniche("Dieta per ipercolesterolemia");

        patientRepository.saveAll(List.of(p1, p2));

        // 3. Database Cibi di test (Valori nutrizionali per 100g)
        List<Food> foods = List.of(
                createFood("Petto di Pollo", "Carni", 165.0, 31.0, 0.0, 3.6, 0.0),
                createFood("Riso Basmati", "Cereali e Tuberi", 350.0, 7.0, 78.0, 0.9, 1.0),
                createFood("Olio Extravergine d'Oliva", "Grassi e Condimenti", 884.0, 0.0, 0.0, 100.0, 0.0),
                createFood("Mela", "Frutta", 52.0, 0.3, 14.0, 0.2, 2.4),
                createFood("Fiocchi d'Avena", "Cereali e Tuberi", 389.0, 16.9, 66.3, 6.9, 10.6),
                createFood("Uova fresche", "Uova e Latticini", 155.0, 13.0, 1.1, 11.0, 0.0),
                createFood("Salmone Atlantico", "Pesce", 208.0, 20.0, 0.0, 13.0, 0.0),
                createFood("Broccoli bolliti", "Verdure", 35.0, 2.4, 7.2, 0.4, 3.3),
                createFood("Mandorle", "Frutta Secca", 579.0, 21.0, 21.6, 49.9, 12.5),
                createFood("Yogurt Greco 0%", "Latticini", 59.0, 10.0, 3.6, 0.0, 0.0)
        );

        foodRepository.saveAll(foods);

        System.out.println("✅ DataInitializer: Database popolato con successo con nutrizionista, pazienti ed alimenti di prova!");
    }

    private Food createFood(String nome, String categoria, Double calorie, Double proteine, Double carboidrati, Double grassi, Double fibre) {
        Food food = new Food();
        food.setNome(nome);
        food.setCategoria(categoria);
        food.setCalorie(calorie);
        food.setProteine(proteine);
        food.setCarboidrati(carboidrati);
        food.setGrassi(grassi);
        food.setFibre(fibre);
        return food;
    }
}