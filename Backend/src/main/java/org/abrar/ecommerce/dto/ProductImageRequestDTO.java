package org.abrar.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageRequestDTO {
    private Boolean isPrimary = false;
    private Integer displayOrder;
    private String altText;
    private Boolean isActive = true;

}
