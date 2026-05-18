package org.abrar.ecommerce.service.stripe;

import org.abrar.ecommerce.entity.Order;

public interface StripeService {
    String createCheckoutSession(Order order) throws Exception;
}
