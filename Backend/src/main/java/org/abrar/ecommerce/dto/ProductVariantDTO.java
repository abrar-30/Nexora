package org.abrar.ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductVariantDTO {

    private Long variantId;

    private Long productId;

    private String itemCode;

    private String variantName;

    private String shortDescription;

    private String detailedDescription;

    private Boolean isActive;

    private Boolean isDeleted;

    private Double mrp;
    private Double purchasePrice;
    private Double landingCost;
    private Double variantPrice;
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<ProductImageDTO> productImages;
}