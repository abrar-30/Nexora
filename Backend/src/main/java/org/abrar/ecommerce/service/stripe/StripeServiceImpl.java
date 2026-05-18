package org.abrar.ecommerce.service.stripe;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.abrar.ecommerce.entity.Order;
import org.abrar.ecommerce.entity.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.secret.key}")
    private String stripeKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeKey;
    }

    @Override
    public String createCheckoutSession(Order order) throws Exception {

        Payment payment = order.getPayment();

        SessionCreateParams params =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl("http://localhost:5173/success")
                        .setCancelUrl("http://localhost:5173/cancel")
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setQuantity(1L)
                                        .setPriceData(
                                                SessionCreateParams.LineItem.PriceData.builder()
                                                        .setCurrency("inr") // ✅ INR set correctly
                                                        .setUnitAmount((long) (order.getTotalAmount() * 100)) // paisa
                                                        .setProductData(
                                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                        .setName("Order #" + order.getOrderNumber())
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .build()
                        )
                        // ✅ Store paymentId for webhook
                        .putMetadata("paymentId", payment.getPaymentId().toString())
                        .build();

        Session session = Session.create(params);

        return session.getUrl();
    }
}