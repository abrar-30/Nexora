package org.abrar.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMasterRequestDTO {
    private Long variantId;
    private Double quantity;
    private LocalDate expiryDate;
    private String batchNumber;
}
