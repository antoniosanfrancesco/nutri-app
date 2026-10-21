package com.nutriapp.backend.config;

import com.nutriapp.backend.entity.Food;
import com.nutriapp.backend.entity.User;
import com.nutriapp.backend.repository.FoodRepository;
import com.nutriapp.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final FoodRepository foodRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(FoodRepository foodRepository, 
                      UserRepository userRepository, 
                      PasswordEncoder passwordEncoder) {
        this.foodRepository = foodRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {

        // 1. Popolamento Utente Nutrizionista di test
        if (userRepository.count() == 0) {
            User testUser = new User();
            testUser.setEmail("admin@nutriapp.com");
            testUser.setPassword(passwordEncoder.encode("password123")); // Fondamentale cifrare la password
            testUser.setNome("Dottore");
            testUser.setCognome("Test");
            
            userRepository.save(testUser);
            System.out.println(">>> DataSeeder: Utente creato -> Email: admin@nutriapp.com | Password: password123");
        }

        // 2. Popolamento Alimenti
        if (foodRepository.count() == 0) {
            List<Food> initialFoods = List.of(
                createFood("Pasta di semola", "Cereali e derivati", 353.0, 13.0, 72.0, 1.5, 3.0),
                createFood("Riso Carnaroli", "Cereali e derivati", 358.0, 7.0, 80.0, 0.6, 1.0),
                createFood("Pane di tipo 0", "Cereali e derivati", 265.0, 8.5, 49.0, 3.1, 3.8),
                createFood("Fiocchi d'avena", "Cereali e derivati", 389.0, 16.9, 66.3, 6.9, 10.6),
                createFood("Petto di pollo", "Carne", 110.0, 23.0, 0.0, 1.2, 0.0),
                createFood("Macinato di tacchino", "Carne", 143.0, 19.5, 0.0, 7.2, 0.0),
                createFood("Salmone fresco", "Pesce", 208.0, 20.0, 0.0, 13.0, 0.0),
                createFood("Filetto di merluzzo", "Pesce", 82.0, 17.8, 0.0, 0.7, 0.0),
                createFood("Uovo intero", "Uova", 155.0, 12.5, 0.7, 11.0, 0.0),
                createFood("Ricotta vaccina", "Latticini", 146.0, 8.8, 3.5, 10.9, 0.0),
                createFood("Yogurt greco 0%", "Latticini", 59.0, 10.3, 3.6, 0.0, 0.0),
                createFood("Mozzarella di vacca", "Latticini", 253.0, 18.7, 0.7, 19.5, 0.0),
                createFood("Olio extravergine d'oliva", "Grassi e oli", 884.0, 0.0, 0.0, 100.0, 0.0),
                createFood("Noci sgusciate", "Frutta secca", 654.0, 15.2, 13.7, 65.2, 6.7),
                createFood("Mela", "Frutta", 52.0, 0.3, 13.8, 0.2, 2.4),
                createFood("Banana", "Frutta", 89.0, 1.1, 22.8, 0.3, 2.6),
                createFood("Zucchine", "Verdura", 17.0, 1.2, 3.1, 0.3, 1.0),
                createFood("Insalata Lattuga", "Verdura", 15.0, 1.4, 2.2, 0.2, 1.5),
                createFood("Petto di tacchino affettato", "Salumi", 107.0, 22.0, 1.0, 1.5, 0.0)
            );

            foodRepository.saveAll(initialFoods);
            System.out.println(">>> DataSeeder: Popolato il database con " + initialFoods.size() + " alimenti di base.");
        }
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
        food.setNutritionist(null);
        return food;
    }
}