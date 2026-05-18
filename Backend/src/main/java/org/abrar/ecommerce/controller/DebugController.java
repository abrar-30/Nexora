package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.entity.Order;
import org.abrar.ecommerce.entity.Payment;
import org.abrar.ecommerce.entity.StockTransaction;
import org.abrar.ecommerce.repository.OrderRepository;
import org.abrar.ecommerce.repository.PaymentRepository;
import org.abrar.ecommerce.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/debug")
public class DebugController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private org.abrar.ecommerce.service.Payment.PaymentService paymentService;

    @GetMapping("/order/{orderId}/full")
    public ResponseEntity<ApiResponse<Object>> getOrderFull(@PathVariable Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Order not found", null));
        }
        Order order = orderOpt.get();

        List<Payment> payments = paymentRepository.findAll();
        // narrow payments for order
        payments = paymentRepository.findAll().stream()
                .filter(p -> p.getOrder() != null && p.getOrder().getOrderId().equals(orderId))
                .toList();

        List<StockTransaction> txs = stockTransactionRepository.findAll().stream()
                .filter(t -> t.getOrderId() != null && t.getOrderId().equals(orderId))
                .toList();

        var result = new java.util.HashMap<String, Object>();
        result.put("order", order);
        result.put("payments", payments);
        result.put("stockTransactions", txs);

        return ResponseEntity.ok(ApiResponse.success("Debug data", result));
    }

    @GetMapping("/order/number/{orderNumber}/full")
    public ResponseEntity<ApiResponse<Object>> getOrderFullByNumber(@PathVariable String orderNumber) {
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Order not found", null));
        }
        Order order = orderOpt.get();
        return getOrderFull(order.getOrderId());
    }

    @PostMapping("/mark-paid/{paymentId}")
    public ResponseEntity<ApiResponse<Object>> markPaymentPaid(@PathVariable Long paymentId, @org.springframework.web.bind.annotation.RequestParam(required = false) String transactionId) {
        Optional<Payment> pOpt = paymentRepository.findById(paymentId);
        if (pOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Payment not found", null));
        }
        try {
            paymentService.markPaymentSuccess(paymentId, transactionId);
            return ResponseEntity.ok(ApiResponse.success("Marked payment paid (debug)", null));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResponse.error("Failed to mark payment: " + ex.getMessage(), null));
        }
    }
}




