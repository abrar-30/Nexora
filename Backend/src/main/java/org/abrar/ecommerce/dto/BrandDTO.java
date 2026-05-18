package org.abrar.ecommerce.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BrandDTO {
    private Long brandId;
    private String brandName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}