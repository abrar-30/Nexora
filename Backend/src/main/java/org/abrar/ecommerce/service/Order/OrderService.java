package org.abrar.ecommerce.service.Order;

import org.abrar.ecommerce.dto.OrderDTO;
import org.abrar.ecommerce.dto.OrderResponseDTO;
import org.abrar.ecommerce.entity.Order;
import org.abrar.ecommerce.entity.enums.OrderStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface OrderService {
    OrderDTO createOrder(OrderDTO requestDTO);

    Order createOrderEntity(OrderDTO requestDTO);

    List<OrderDTO> getOrdersByEmail(String email);

    OrderDTO updateOrder(Long orderId, OrderDTO requestDTO);

    OrderDTO getOrderById(Long orderId);

    List<OrderDTO> getAllOrders();

    List<OrderDTO> getOrdersByUserId(Long userId);

    OrderDTO getByOrderNumber(String orderNumber);

    List<OrderDTO> getOrdersByStatus(OrderStatus status);

    void deleteOrder(Long orderId);

    @Transactional
    OrderResponseDTO createOrderWithPayment(OrderDTO requestDTO) throws Exception;

    @Transactional
    void markOrderAsPaid(Long orderId);

    void deductStockForOrder(Order order);
}