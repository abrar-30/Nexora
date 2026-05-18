package org.abrar.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityDTO {
    private Long cityId;

    @NotBlank(message = "City name is required")
    private String cityName;

    @NotNull(message = "State ID is required")
    private Long stateId;

    private String stateName;  // response only
    private String countryName; // response only
}
