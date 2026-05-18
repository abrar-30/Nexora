package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query(value = "SELECT * FROM cart_items WHERE cart_id = :cartId", nativeQuery = true)
    List<CartItem> findByCartId(@Param("cartId") Long cartId);

    @Query(value = "SELECT * FROM cart_items WHERE cart_id = :cartId AND product_variant_id = :variantId", nativeQuery = true)
    Optional<CartItem> findByCartIdAndVariantId(@Param("cartId") Long cartId, @Param("variantId") Long variantId);

    @Modifying
    @Query(value = "DELETE FROM cart_items WHERE cart_id = :cartId", nativeQuery = true)
    void deleteAllByCartId(@Param("cartId") Long cartId);

    @Query(value = "SELECT COALESCE(SUM(ci.item_total), 0) FROM cart_items ci WHERE ci.cart_id = :cartId", nativeQuery = true)
    Double calculateCartTotal(@Param("cartId") Long cartId);

    @Query(value = "SELECT COALESCE(SUM(ci.quantity), 0) FROM cart_items ci WHERE ci.cart_id = :cartId", nativeQuery = true)
    Integer calculateTotalItems(@Param("cartId") Long cartId);
}