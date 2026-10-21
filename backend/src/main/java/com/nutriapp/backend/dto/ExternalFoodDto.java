package com.nutriapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ExternalFoodDto {
    private String code; // Barcode
    private String nome;
    private Double calorie;
    private Double proteine;
    private Double carboidrati;
    private Double grassi;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Double getCalorie() { return calorie; }
    public void setCalorie(Double calorie) { this.calorie = calorie; }
    public Double getProteine() { return proteine; }
    public void setProteine(Double proteine) { this.proteine = proteine; }
    public Double getCarboidrati() { return carboidrati; }
    public void setCarboidrati(Double carboidrati) { this.carboidrati = carboidrati; }
    public Double getGrassi() { return grassi; }
    public void setGrassi(Double grassi) { this.grassi = grassi; }
}