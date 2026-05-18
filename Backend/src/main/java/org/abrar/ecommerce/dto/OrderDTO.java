package org.abrar.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.abrar.ecommerce.entity.embeddable.OrderAddress;
import org.abrar.ecommerce.entity.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private Double totalAmount;
    private Double taxableAmount;
    private OrderStatus orderStatus;
    private OrderAddress shippingAddress;
    private List<OrderItemDTO> orderItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}