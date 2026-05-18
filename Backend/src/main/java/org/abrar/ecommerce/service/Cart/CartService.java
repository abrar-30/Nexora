package org.abrar.ecommerce.service.Cart;

import org.abrar.ecommerce.dto.CartDTO;
import org.abrar.ecommerce.dto.CartItemDTO;

import java.util.List;

public interface CartService {
    CartDTO getCart(String email);

    CartDTO manageCartItem(String email, Long variantId, Integer quantity);

    CartDTO clearCart(String email);

    List<CartItemDTO> getCartItems(String email);
}