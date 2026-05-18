package org.abrar.ecommerce.service.Payment;

import com.stripe.model.checkout.Session;
import org.abrar.ecommerce.dto.PaymentDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PaymentService {

    @Transactional
    void markPaymentSuccess(Long paymentId, Session session);

    @Transactional
    void markPaymentSuccess(Long paymentId, String transactionId);

    @Transactional
    void markPaymentFailed(Long paymentId);

    String retryPayment(Long orderId) throws Exception;

    List<PaymentDTO> getAllPayments();
}
