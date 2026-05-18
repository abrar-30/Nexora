package org.abrar.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequestDTO {

    @NotBlank(message = "Variant name is required")
    private String variantName;

    @NotBlank(message = "Item code is required")
    private String itemCode;

    private String shortDescription;
    private String detailedDescription;

    // Variant-specific pricing
    @NotNull(message = "Variant price is required")
    @Positive(message = "Variant price must be positive")
    private Double variantPrice;

    private Double mrp;
    private Double purchasePrice;
    private Double landingCost;

    // Stock fields
    private Double quantity;

    private Boolean isActive;
    private LocalDate expiryDate;
    // batchNumber → auto-generated
}