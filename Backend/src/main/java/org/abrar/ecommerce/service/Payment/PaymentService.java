package org.abrar.ecommerce.service.Payment;

import com.stripe.model.checkout.Session;
import org.springframework.transaction.annotation.Transactional;

public interface PaymentService {

    @Transactional
    void markPaymentSuccess(Long paymentId, Session session);

    @Transactional
    void markPaymentSuccess(Long paymentId, String transactionId);

    @Transactional
    void markPaymentFailed(Long paymentId);

    String retryPayment(Long orderId) throws Exception;
}
