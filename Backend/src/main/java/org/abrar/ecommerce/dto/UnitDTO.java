package org.abrar.ecommerce.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UnitDTO {
    private Long unitId;
    private String unitName;
    private String shortName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}