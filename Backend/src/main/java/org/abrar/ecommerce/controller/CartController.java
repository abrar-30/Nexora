package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.CartDTO;
import org.abrar.ecommerce.dto.CartItemDTO;
import org.abrar.ecommerce.service.Cart.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    private String getEmailFromToken() {
        return SecurityContextHolder.getContext()
                .getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartDTO>> getCart() {
        return ResponseEntity.ok(ApiResponse.success("Cart fetched",
                cartService.getCart(getEmailFromToken())));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<CartItemDTO>>> getCartItems() {
        return ResponseEntity.ok(ApiResponse.success("Cart items fetched",
                cartService.getCartItems(getEmailFromToken())));
    }

    @PostMapping("/manage")
    public ResponseEntity<ApiResponse<CartDTO>> manageCartItem(
            @RequestParam Long variantId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(ApiResponse.success("Cart updated",
                cartService.manageCartItem(getEmailFromToken(), variantId, quantity)));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<CartDTO>> clearCart() {
        return ResponseEntity.ok(ApiResponse.success("Cart cleared",
                cartService.clearCart(getEmailFromToken())));
    }
}
