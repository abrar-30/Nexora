package org.abrar.ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AddressResponseDTO {

    private Long addressId;
    private String addressLine1;
    private String addressLine2;

    // Names for display
    private String cityName;
    private String stateName;
    private String countryName;

    private String postalCode;
    private String phoneNumber;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
