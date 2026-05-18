package org.abrar.ecommerce.service.Payment;

import com.stripe.model.checkout.Session;
import jakarta.persistence.EntityManager;
import org.abrar.ecommerce.entity.Order;
import org.abrar.ecommerce.entity.Payment;
import org.abrar.ecommerce.entity.enums.OrderStatus;
import org.abrar.ecommerce.entity.enums.PaymentStatus;
import org.abrar.ecommerce.repository.OrderRepository;
import org.abrar.ecommerce.repository.PaymentRepository;
import org.abrar.ecommerce.service.Order.OrderService;
import org.abrar.ecommerce.service.stripe.StripeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EntityManager entityManager;

    @Transactional
    @Override
    public void markPaymentSuccess(Long paymentId, Session session) {

        try {
            log.info("🔍 [markPaymentSuccess] Starting for paymentId: {}", paymentId);

            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for ID: " + paymentId));

            log.info("✓ [markPaymentSuccess] Found payment: {}", payment.getPaymentId());
            log.info("  Current status: {}", payment.getPaymentStatus());

            // جلوگیری duplicate update
            if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
                log.warn("⚠️ [markPaymentSuccess] Payment already COMPLETED, skipping");
                return;
            }

            log.info("🔄 [markPaymentSuccess] Updating payment status to COMPLETED");
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(session.getPaymentIntent());
            payment.setPaymentMethod("STRIPE");

            Order order = payment.getOrder();
            if (order == null) {
                log.error("❌ [markPaymentSuccess] Order is NULL for payment {}", paymentId);
                throw new RuntimeException("Order not found for payment: " + paymentId);
            }

            log.info("✓ [markPaymentSuccess] Found order: orderId={}, current status={}", order.getOrderId(), order.getOrderStatus());

            log.info("🔄 [markPaymentSuccess] Updating order status to CONFIRMED");
            order.setOrderStatus(OrderStatus.CONFIRMED);

            // ✅ Use EntityManager to ensure persistence
            log.info("💾 [markPaymentSuccess] Merging and flushing payment...");
            Payment mergedPayment = entityManager.merge(payment);
            log.info("✅ [markPaymentSuccess] Payment merged");

            log.info("💾 [markPaymentSuccess] Merging and flushing order...");
            Order mergedOrder = entityManager.merge(order);
            log.info("✅ [markPaymentSuccess] Order merged");

            log.info("💾 [markPaymentSuccess] Flushing changes to database...");
            entityManager.flush();
            log.info("✅ [markPaymentSuccess] Changes flushed to database");

            log.info("📦 [markPaymentSuccess] Deducting stock for order");
            orderService.deductStockForOrder(mergedOrder);
            log.info("✅ [markPaymentSuccess] Stock deducted successfully");

            log.info("🎉 [markPaymentSuccess] COMPLETED - Payment and Order updated successfully");

        } catch (Exception ex) {
            log.error("❌ [markPaymentSuccess] ERROR - Exception occurred", ex);
            ex.printStackTrace();
            throw ex;
        }

    }

    @Override
    public void markPaymentSuccess(Long paymentId, String transactionId) {
        // Create a minimal Session-like context: update payment transactionId and proceed
        try {
            log.info("🔍 [markPaymentSuccess(transactionId)] Starting for paymentId: {}", paymentId);

            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for ID: " + paymentId));

            if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
                log.warn("⚠️ [markPaymentSuccess(transactionId)] Payment already COMPLETED, skipping");
                return;
            }

            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(transactionId);
            payment.setPaymentMethod("STRIPE");

            Order order = payment.getOrder();
            if (order == null) {
                log.error("❌ [markPaymentSuccess(transactionId)] Order is NULL for payment {}", paymentId);
                throw new RuntimeException("Order not found for payment: " + paymentId);
            }

            order.setOrderStatus(OrderStatus.CONFIRMED);

            Payment savedPayment = paymentRepository.save(payment);
            Order savedOrder = orderRepository.save(order);
            entityManager.flush();

            try {
                orderService.deductStockForOrder(savedOrder);
            } catch (Exception stockEx) {
                log.error("⚠️ [markPaymentSuccess(transactionId)] Stock deduction failed, payment saved: {}", stockEx.getMessage(), stockEx);
            }

            log.info("🎉 [markPaymentSuccess(transactionId)] COMPLETED for paymentId={}", paymentId);

        } catch (Exception ex) {
            log.error("❌ [markPaymentSuccess(transactionId)] ERROR - Exception occurred", ex);
            throw ex;
        }
    }

    @Transactional
    @Override
    public void markPaymentFailed(Long paymentId) {

        try {
            log.info("🔍 [markPaymentFailed] Starting for paymentId: {}", paymentId);

            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for ID: " + paymentId));

            log.info("✓ [markPaymentFailed] Found payment: {}", payment.getPaymentId());

            if (payment.getPaymentStatus() == PaymentStatus.FAILED) {
                log.warn("⚠️ [markPaymentFailed] Payment already FAILED, skipping");
                return;
            }

            payment.setPaymentStatus(PaymentStatus.FAILED);

            Order order = payment.getOrder();
            if (order == null) {
                log.error("❌ [markPaymentFailed] Order is NULL for payment {}", paymentId);
                throw new RuntimeException("Order not found for payment: " + paymentId);
            }

            log.info("✓ [markPaymentFailed] Found order: orderId={}", order.getOrderId());

            // Recommended: allow retry
            order.setOrderStatus(OrderStatus.PENDING);

            // ✅ Use EntityManager to ensure persistence
            log.info("💾 [markPaymentFailed] Merging payment and order...");
            entityManager.merge(payment);
            entityManager.merge(order);
            entityManager.flush();
            log.info("✅ [markPaymentFailed] Payment and order persisted");

        } catch (Exception ex) {
            log.error("❌ [markPaymentFailed] ERROR - Exception occurred", ex);
            ex.printStackTrace();
            throw ex;
        }
    }
    @Override
    @Transactional
    public String retryPayment(Long orderId) throws Exception {

        Payment payment = paymentRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Already paid");
        }

        return stripeService.createCheckoutSession(payment.getOrder());
    }
}