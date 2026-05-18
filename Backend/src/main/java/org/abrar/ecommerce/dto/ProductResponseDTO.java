package org.abrar.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {

    private Long productId;

    private String productName;

    private String productDisplayName;

    private String description;

    private Double basePrice;

    private Double mrp;

    private Double purchasePrice;

    private Double landingCost;

    private String mainImageUrl;

    private String brandName;

    private String categoryName;

    private String unitName;

    private String taxSlabName;

    private Double taxPercentage;

    private Boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<ProductVariantDTO> variants;
}