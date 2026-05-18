package org.abrar.ecommerce.dto;

import lombok.Data;
import org.abrar.ecommerce.entity.enums.PaymentStatus;

@Data
public class PaymentDTO {
    private Long paymentId;
    private Long orderId;
    private String transactionId;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
}
