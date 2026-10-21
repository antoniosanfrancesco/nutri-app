package com.nutriapp.backend.controller;

import com.nutriapp.backend.dto.ActivityLevel;
import com.nutriapp.backend.dto.Goal;
import com.nutriapp.backend.dto.NutritionalTargetDto;
import com.nutriapp.backend.service.NutritionalCalculationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/calculations")
@CrossOrigin(origins = "*")
public class CalculationController {

    private final NutritionalCalculationService calculationService;

    public CalculationController(NutritionalCalculationService calculationService) {
        this.calculationService = calculationService;
    }

    // GET /api/calculations/target?peso=75&altezza=175&dataNascita=1995-05-20&sesso=M&activityLevel=MODERATELY_ACTIVE&goal=WEIGHT_LOSS
    @GetMapping("/target")
    public ResponseEntity<NutritionalTargetDto> calculateTarget(
            @RequestParam BigDecimal peso,
            @RequestParam BigDecimal altezza,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataNascita,
            @RequestParam String sesso,
            @RequestParam(defaultValue = "MODERATELY_ACTIVE") ActivityLevel activityLevel,
            @RequestParam(defaultValue = "MAINTENANCE") Goal goal
    ) {
        NutritionalTargetDto target = calculationService.calculateFullTarget(
                peso, altezza, dataNascita, sesso, activityLevel, goal
        );
        return ResponseEntity.ok(target);
    }
}