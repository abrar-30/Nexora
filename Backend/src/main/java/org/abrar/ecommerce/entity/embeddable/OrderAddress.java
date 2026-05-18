package org.abrar.ecommerce.entity.embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderAddress {

    @NotBlank
    @Column(name = "shipping_name", nullable = false, updatable = false)
    private String shippingName;

    @NotBlank
    @Column(name = "shipping_address_line_1", nullable = false, updatable = false)
    private String shippingAddressLine1;

    @Column(name = "shipping_address_line_2", updatable = false)
    private String shippingAddressLine2;

    @NotBlank
    @Column(name = "shipping_city", nullable = false, length = 100, updatable = false)
    private String shippingCity;

    @NotBlank
    @Column(name = "shipping_state", nullable = false, length = 100, updatable = false)
    private String shippingState;

    @NotBlank
    @Column(name = "shipping_postal_code", nullable = false, length = 20, updatable = false)
    private String shippingPostalCode;

    @NotBlank
    @Column(name = "shipping_country", nullable = false, length = 100, updatable = false)
    private String shippingCountry;

    @Column(name = "shipping_phone", length = 20, updatable = false)
    private String shippingPhone;
}