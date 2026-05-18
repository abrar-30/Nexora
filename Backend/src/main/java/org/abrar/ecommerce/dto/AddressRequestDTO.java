package org.abrar.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequestDTO {

    @NotBlank(message = "Address line 1 is required")
    private String addressLine1;

    private String addressLine2;

    @NotNull(message = "City is required")
    private Long cityId;

    @NotNull(message = "State is required")
    private Long stateId;

    @NotNull(message = "Country is required")
    private Long countryId;

    @NotBlank(message = "Postal code is required")
    private String postalCode;

    private String phoneNumber;

    private Boolean isDefault = false;
}