package org.abrar.ecommerce.service.Order;

import org.abrar.ecommerce.dto.OrderDTO;
import org.abrar.ecommerce.dto.OrderItemDTO;
import org.abrar.ecommerce.dto.OrderResponseDTO;
import org.abrar.ecommerce.dto.PaymentDTO;
import org.abrar.ecommerce.entity.*;
import org.abrar.ecommerce.entity.enums.OrderStatus;
import org.abrar.ecommerce.entity.enums.PaymentStatus;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.exception.UserNotFoundException;
import org.abrar.ecommerce.repository.*;
import org.abrar.ecommerce.service.stripe.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private StockMasterRepository stockMasterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private PaymentRepository  paymentRepository;

    @Autowired
    private StripeService stripeService;


    @Override
    @Transactional
    public OrderDTO createOrder(OrderDTO requestDTO) {
        if (requestDTO.getUserId() == null) {
            throw new IllegalArgumentException("userId is required for order creation");
        }

        validateStock(requestDTO);

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + requestDTO.getUserId()));

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(requestDTO.getTotalAmount());
        order.setTaxableAmount(requestDTO.getTaxableAmount());
        order.setShippingAddress(requestDTO.getShippingAddress());
        order.setOrderNumber(requestDTO.getOrderNumber() != null && !requestDTO.getOrderNumber().isBlank()
                ? requestDTO.getOrderNumber() : generateUniqueOrderNumber());
        order.setOrderStatus(OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(order);

        if (requestDTO.getOrderItems() != null && !requestDTO.getOrderItems().isEmpty()) {
            List<OrderItem> orderItems = new ArrayList<>();
            for (OrderItemDTO itemDTO : requestDTO.getOrderItems()) {
                OrderItem item = new OrderItem();
                item.setQuantity(itemDTO.getQuantity());
                item.setPriceAtPurchase(itemDTO.getPriceAtPurchase());
                item.setOrder(savedOrder);
                if (itemDTO.getVariantId() != null) {
                    ProductVariant variant = productVariantRepository.findById(itemDTO.getVariantId())
                            .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with ID: " + itemDTO.getVariantId()));
                    item.setVariant(variant);
                }
                orderItems.add(item);
            }
            List<OrderItem> savedItems = orderItemRepository.saveAll(orderItems);
            savedOrder.setOrderItems(savedItems);
        }

        return convertToDTO(savedOrder);
    }

    @Override
    @Transactional
    public Order createOrderEntity(OrderDTO requestDTO) {
        if (requestDTO.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }

        if (requestDTO.getOrderItems() == null || requestDTO.getOrderItems().isEmpty()) {
            throw new IllegalArgumentException("orderItems are required");
        }

        if (requestDTO.getShippingAddress() == null) {
            throw new IllegalArgumentException("shippingAddress is required");
        }

        if (requestDTO.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }

        validateStock(requestDTO);

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(requestDTO.getTotalAmount());
        order.setTaxableAmount(requestDTO.getTaxableAmount());
        order.setShippingAddress(requestDTO.getShippingAddress());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setOrderNumber(generateUniqueOrderNumber());

        Order savedOrder = orderRepository.save(order);

        if (requestDTO.getOrderItems() != null && !requestDTO.getOrderItems().isEmpty()) {
            List<OrderItem> orderItems = new ArrayList<>();
            for (OrderItemDTO itemDTO : requestDTO.getOrderItems()) {
                OrderItem item = new OrderItem();
                item.setQuantity(itemDTO.getQuantity());
                item.setPriceAtPurchase(itemDTO.getPriceAtPurchase());
                item.setOrder(savedOrder);
                if (itemDTO.getVariantId() != null) {
                    ProductVariant variant = productVariantRepository.findById(itemDTO.getVariantId())
                            .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with ID: " + itemDTO.getVariantId()));
                    item.setVariant(variant);
                }
                orderItems.add(item);
            }
            List<OrderItem> savedItems = orderItemRepository.saveAll(orderItems);
            savedOrder.setOrderItems(savedItems);
        }

        return savedOrder;
    }
    @Override
    public List<OrderDTO> getOrdersByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return orderRepository.findOrdersByUserId(user.getUserId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

    }

    @Override
    @Transactional
    public OrderDTO updateOrder(Long orderId, OrderDTO requestDTO) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (requestDTO.getTotalAmount() != null) {
            order.setTotalAmount(requestDTO.getTotalAmount());
        }
        if (requestDTO.getTaxableAmount() != null) {
            order.setTaxableAmount(requestDTO.getTaxableAmount());
        }
        if (requestDTO.getShippingAddress() != null) {
            order.setShippingAddress(requestDTO.getShippingAddress());
        }
        if (requestDTO.getOrderStatus() != null) {
            order.setOrderStatus(requestDTO.getOrderStatus());
        }

        if (requestDTO.getOrderItems() != null && !requestDTO.getOrderItems().isEmpty()) {
            orderItemRepository.deleteByOrderId(orderId);

            List<OrderItem> newItems = new ArrayList<>();
            for (OrderItemDTO itemDTO : requestDTO.getOrderItems()) {
                OrderItem item = new OrderItem();
                item.setQuantity(itemDTO.getQuantity());
                item.setPriceAtPurchase(itemDTO.getPriceAtPurchase());
                item.setOrder(order);
                if (itemDTO.getVariantId() != null) {
                    ProductVariant variant = productVariantRepository.findById(itemDTO.getVariantId())
                            .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with ID: " + itemDTO.getVariantId()));
                    item.setVariant(variant);
                }
                newItems.add(item);
            }
            List<OrderItem> savedItems = orderItemRepository.saveAll(newItems);
            order.setOrderItems(savedItems);
        }

        Order updated = orderRepository.save(order);
        return convertToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return convertToDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        return orderRepository.findOrdersByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getByOrderNumber(String orderNumber) {
        if (orderNumber == null || orderNumber.isBlank()) {
            throw new IllegalArgumentException("orderNumber is required");
        }

        String normalizedOrderNumber = orderNumber.trim().toUpperCase();

        Order order = orderRepository.findByOrderNumber(normalizedOrderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + normalizedOrderNumber));
        return convertToDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByOrderStatus(status.name()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        orderItemRepository.deleteByOrderId(orderId);
        orderRepository.delete(order);
    }

    @Transactional
    @Override
    public OrderResponseDTO createOrderWithPayment(OrderDTO requestDTO) throws Exception {

        // 1. Create Order ONLY
        Order order = createOrderEntity(requestDTO);

        // 2. Create Payment (ONLY HERE)
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod("STRIPE");

        paymentRepository.save(payment);

        order.setPayment(payment);

        // 3. Stripe session
        String paymentUrl = stripeService.createCheckoutSession(order);

        // 4. Response
        return mapToOrderResponseDTO(order, paymentUrl);
    }

    private void validateStock(OrderDTO requestDTO) {
        if (requestDTO.getOrderItems() == null || requestDTO.getOrderItems().isEmpty()) {
            throw new IllegalArgumentException("Order items are required");
        }

        for (OrderItemDTO itemDTO : requestDTO.getOrderItems()) {
            if (itemDTO.getVariantId() == null) {
                throw new IllegalArgumentException("variantId is required for each order item");
            }
            if (itemDTO.getQuantity() == null || itemDTO.getQuantity() <= 0) {
                throw new IllegalArgumentException("quantity must be greater than zero");
            }

            double requiredQty = itemDTO.getQuantity().doubleValue();
            Double availableQty = stockMasterRepository
                    .getAvailableQtyByVariantId(itemDTO.getVariantId());

            if (availableQty == null || availableQty < requiredQty) {
                throw new ResourceNotFoundException(
                        "Insufficient stock for variant ID: " + itemDTO.getVariantId()
                );
            }
        }
    }
    @Transactional
    @Override
    public void markOrderAsPaid(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setOrderStatus(OrderStatus.PAID);
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getOrderItems() == null
                ? new ArrayList<>()
                : order.getOrderItems().stream()
                .map(item -> new OrderItemDTO(
                        item.getOrderItemId(),
                        item.getVariant() != null ? item.getVariant().getProductVariantId() : null,
                        item.getQuantity(),
                        item.getPriceAtPurchase()
                ))
                .collect(Collectors.toList());

        return new OrderDTO(
                order.getOrderId(),
                order.getOrderNumber(),
                order.getUser() != null ? order.getUser().getUserId() : null,
                order.getTotalAmount(),
                order.getTaxableAmount(),
                order.getOrderStatus(),
                order.getShippingAddress(),
                itemDTOs,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
    private OrderResponseDTO mapToOrderResponseDTO(Order order, String paymentUrl) {

        Payment payment = order.getPayment();

        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setPaymentId(payment.getPaymentId());
        paymentDTO.setOrderId(order.getOrderId());
        paymentDTO.setPaymentStatus(payment.getPaymentStatus());
        paymentDTO.setPaymentMethod(payment.getPaymentMethod());
        paymentDTO.setTransactionId(payment.getTransactionId());

        OrderResponseDTO response = new OrderResponseDTO();
        response.setOrderId(order.getOrderId());
        response.setOrderNumber(order.getOrderNumber());
        response.setPaymentUrl(paymentUrl);
        response.setPayment(paymentDTO);

        return response;
    }


    private String generateUniqueOrderNumber() {
        int attempts = 0;

        while (attempts < 5) {
            String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            if (!orderRepository.existsByOrderNumber(orderNumber)) {
                return orderNumber;
            }

            attempts++;
        }

        throw new RuntimeException("Failed to generate unique order number");
    }

    @Override
    public void deductStockForOrder(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) return;

        for (OrderItem item : order.getOrderItems()) {
            if (item.getVariant() == null) continue;

            Long variantId   = item.getVariant().getProductVariantId();
            double requiredQty = item.getQuantity() == null ? 0 : item.getQuantity().doubleValue();

            if (requiredQty <= 0) continue;

            // ✅ Re-validate at deduction time (race condition protection)
            Double availableQty = stockMasterRepository.getAvailableQtyByVariantId(variantId);
            if (availableQty == null || availableQty < requiredQty) {
                throw new ResourceNotFoundException(
                        "Insufficient stock at payment time for variant ID: " + variantId
                );
            }

            List<StockMaster> batches = stockMasterRepository.findAvailableBatchesForUpdate(
                    variantId,
                    LocalDate.now()
            );

            for (StockMaster batch : batches) {
                if (requiredQty <= 0) break;

                double batchQty = batch.getQuantity() == null ? 0D : batch.getQuantity();
                if (batchQty <= 0) continue;

                double deduct = Math.min(batchQty, requiredQty);
                double newQty = batchQty - deduct;

                stockMasterRepository.updateStockQuantity(batch.getStockId(), newQty);

                requiredQty -= deduct;
            }

            if (requiredQty > 0) {
                throw new ResourceNotFoundException(
                        "Could not fully deduct stock for variant ID: " + variantId
                );
            }
        }
    }

}