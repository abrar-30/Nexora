package org.abrar.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StateDTO {
    private Long stateId;

    @NotBlank(message = "State name is required")
    private String stateName;

    @NotNull(message = "Country ID is required")
    private Long countryId;

    private String countryName; // response only
}
