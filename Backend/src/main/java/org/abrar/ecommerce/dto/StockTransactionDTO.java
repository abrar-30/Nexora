package org.abrar.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockTransactionDTO {
    
    private Long stockTransactionId;
    private Long variantId;
    private Double inQuantity;
    private Double outQuantity;
    private String description;
    private Double landingCost;
    private Double sellingPrice;
    private Long orderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

