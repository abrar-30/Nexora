package org.abrar.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDTO {

    @NotBlank(message = "Product name is required")
    private String productName;

    private String productDisplayName;

    private String description;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    private Double basePrice;

    private Double mrp;

    private Double purchasePrice;

    private Double landingCost;

    private String mainImageUrl;
    private String itemCode;

    @NotNull(message = "Brand ID is required")
    private Long brandId;

    private Long categoryId;

    private Long unitId;

    private Long taxSlabId;
    private List<ProductVariantRequestDTO> variants;
}