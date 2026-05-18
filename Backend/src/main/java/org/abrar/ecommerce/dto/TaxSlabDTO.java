package org.abrar.ecommerce.dto;

import lombok.Data;

@Data
public class TaxSlabDTO {
    private Long taxSlabId;
    private String taxName;
    private Double taxPercentage;
}