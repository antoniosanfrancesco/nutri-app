package com.nutriapp.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutriapp.backend.dto.ExternalFoodDto;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class OpenFoodFactsService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ExternalFoodDto> searchFood(String query) {
        List<ExternalFoodDto> results = new ArrayList<>();
        String url = "https://it.openfoodfacts.org/cgi/search.pl?search_terms=" 
                + query + "&search_simple=1&action=process&json=1&page_size=10";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "NutriApp - SpringBoot Backend");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String jsonResponse = response.getBody();

            // Log di debug nel terminale di Spring Boot
            System.out.println(">>> Risposta da Open Food Facts received: " + (jsonResponse != null ? jsonResponse.length() : 0) + " caratteri");

            if (jsonResponse != null) {
                JsonNode root = objectMapper.readTree(jsonResponse);
                JsonNode products = root.path("products");

                for (JsonNode product : products) {
                    String name = product.path("product_name_it").asText(product.path("product_name").asText("Senza nome"));
                    String brand = product.path("brands").asText("");
                    String fullName = brand.isEmpty() ? name : name + " (" + brand + ")";
                    String code = product.path("code").asText("");

                    JsonNode nutriments = product.path("nutriments");
                    
                    // Estrazione tollerante dei macronutrienti per 100g
                    double kcal = nutriments.has("energy-kcal_100g") ? nutriments.path("energy-kcal_100g").asDouble() : nutriments.path("energy-kcal").asDouble(0.0);
                    double prot = nutriments.has("proteins_100g") ? nutriments.path("proteins_100g").asDouble() : nutriments.path("proteins").asDouble(0.0);
                    double carb = nutriments.has("carbohydrates_100g") ? nutriments.path("carbohydrates_100g").asDouble() : nutriments.path("carbohydrates").asDouble(0.0);
                    double fat = nutriments.has("fat_100g") ? nutriments.path("fat_100g").asDouble() : nutriments.path("fat").asDouble(0.0);

                    results.add(new ExternalFoodDto(code, fullName, kcal, prot, carb, fat));
                }
            }
        } catch (Exception e) {
            System.err.println(">>> ERRORE durante la ricerca Open Food Facts: " + e.getMessage());
            e.printStackTrace();
        }

        return results;
    }
}