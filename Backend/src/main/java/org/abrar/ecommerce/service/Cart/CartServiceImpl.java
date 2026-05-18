package org.abrar.ecommerce.service.Cart;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.abrar.ecommerce.dto.CartDTO;
import org.abrar.ecommerce.dto.CartItemDTO;
import org.abrar.ecommerce.entity.*;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.CartItemRepository;
import org.abrar.ecommerce.repository.CartRepository;
import org.abrar.ecommerce.repository.ProductVariantRepository;
import org.abrar.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           UserRepository userRepository,
                           ProductVariantRepository productVariantRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Override
    public CartDTO manageCartItem(String email, Long variantId, Integer quantity) {

        Cart cart = cartRepository.findByUserId(getUserByEmail(email).getUserId())
                .orElseGet(() -> createNewCart(getUserByEmail(email)));

        // quantity = 0 → remove item
        if (quantity == 0) {
            cartItemRepository.findByCartIdAndVariantId(cart.getCartId(), variantId)
                    .ifPresent(cartItemRepository::delete);
            log.info("Item removed from cart, variantId: {}", variantId);
            return calculateAndSaveCartTotals(cart);
        }

        // quantity < 0 → invalid
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        // quantity > 0 → add or update
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + variantId));

        if (!variant.getIsActive() || variant.getIsDeleted()) {
            throw new IllegalArgumentException("Variant not available: " + variantId);
        }

        cartItemRepository.findByCartIdAndVariantId(cart.getCartId(), variantId)
                .ifPresentOrElse(
                        existing -> {
                            // Item exists → update quantity
                            existing.setQuantity(quantity);
                            existing.setItemTotal(existing.getUnitPrice() * quantity);
                            cartItemRepository.save(existing);
                            log.info("Cart item updated, variantId: {}, quantity: {}", variantId, quantity);
                        },
                        () -> {
                            // Item doesn't exist → add new
                            CartItem newItem = new CartItem();
                            newItem.setCart(cart);
                            newItem.setProductVariant(variant);
                            newItem.setQuantity(quantity);
                            newItem.setUnitPrice(variant.getVariantPrice());
                            newItem.setItemTotal(variant.getVariantPrice() * quantity);
                            cartItemRepository.save(newItem);
                            log.info("Item added to cart, variantId: {}, quantity: {}", variantId, quantity);
                        }
                );

        return calculateAndSaveCartTotals(cart);
    }


    @Override
    public List<CartItemDTO> getCartItems(String email) {
        User user = getUserByEmail(email);

        Cart cart = cartRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + email));

        return cartItemRepository.findByCartId(cart.getCartId())
                .stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CartDTO getCart(String email) {
        User user = getUserByEmail(email);
        Cart cart = cartRepository.findByUserId(user.getUserId())
                .orElseGet(() -> createNewCart(user));
        return convertToDTO(cart);
    }

    @Override
    public CartDTO clearCart(String email) {
        User user = getUserByEmail(email);
        Cart cart = cartRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + email));

        cartItemRepository.deleteAllByCartId(cart.getCartId());

        cart.setTotalItems(0);
        cart.setSubtotal(0.0);
        cart.setTaxAmount(0.0);
        cart.setTotalPrice(0.0);
        cartRepository.save(cart);

        log.info("Cart cleared for user: {}", email);
        return convertToDTO(cart);
    }
    // ---- Helpers ----

    private CartDTO calculateAndSaveCartTotals(Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getCartId());

        double subtotal = 0.0;
        double totalTax = 0.0;

        for (CartItem item : cartItems) {
            double itemTotal = item.getItemTotal();
            subtotal += itemTotal;

            // Tax calculation — handle null tax slab
            Product product = item.getProductVariant().getProduct();
            if (product.getTaxSlab() != null) {
                double taxRate = product.getTaxSlab().getTaxPercentage();
                totalTax += itemTotal * (taxRate / 100);
            }
        }

        double totalPrice = subtotal + totalTax;

        cart.setTotalItems(cartItems.size());
        cart.setSubtotal(subtotal);
        cart.setTaxAmount(totalTax);
        cart.setTotalPrice(totalPrice);
        cartRepository.save(cart);

        log.info("Cart totals calculated — subtotal: {}, tax: {}, total: {}",
                subtotal, totalTax, totalPrice);
        return convertToDTO(cart);
    }

    private Cart createNewCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setTotalItems(0);
        cart.setSubtotal(0.0);
        cart.setTaxAmount(0.0);
        cart.setTotalPrice(0.0);
        return cartRepository.save(cart);
    }


    private CartDTO convertToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setCartId(cart.getCartId());
        dto.setUserId(cart.getUser().getUserId());
        dto.setTotalItems(cart.getTotalItems());
        dto.setSubtotal(cart.getSubtotal());
        dto.setTaxAmount(cart.getTaxAmount());
        dto.setTotalPrice(cart.getTotalPrice());
        dto.setCartItems(cart.getCartItems() != null
                ? cart.getCartItems().stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList())
                : List.of());
        return dto;
    }

    private CartItemDTO convertToCartItemDTO(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        dto.setCartItemId(cartItem.getCartItemId());
        dto.setProductVariantId(cartItem.getProductVariant().getProductVariantId());
        dto.setProductName(cartItem.getProductVariant().getProduct().getProductName());
        dto.setQuantity(cartItem.getQuantity());
        dto.setUnitPrice(cartItem.getUnitPrice());
        dto.setItemTotal(cartItem.getItemTotal());
        return dto;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + email));
    }
}
