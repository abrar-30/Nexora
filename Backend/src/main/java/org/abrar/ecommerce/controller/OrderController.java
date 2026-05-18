package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.OrderDTO;
import org.abrar.ecommerce.dto.OrderResponseDTO;
import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.entity.Order;
import org.abrar.ecommerce.entity.enums.OrderStatus;
import org.abrar.ecommerce.service.Order.OrderService;
import org.abrar.ecommerce.service.stripe.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private StripeService stripeService;

    private String getEmailFromToken() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderDTO dto) throws Exception {

        OrderResponseDTO response = orderService.createOrderWithPayment(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable Long orderId, @RequestBody OrderDTO orderDTO) {
        OrderDTO updated = orderService.updateOrder(orderId, orderDTO);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        OrderDTO order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByUserId(@PathVariable Long userId) {
        List<OrderDTO> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }
    @GetMapping("/user/me")
    public ResponseEntity<List<OrderDTO>> getOrdersByEmail() {
        List<OrderDTO> orders = orderService.getOrdersByEmail(getEmailFromToken());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDTO> getByOrderNumber(@PathVariable String orderNumber) {
        OrderDTO order = orderService.getByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/by-number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderByOrderNumber(@PathVariable String orderNumber) {
        OrderDTO order = orderService.getByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success("Order fetched successfully", order));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<OrderDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}