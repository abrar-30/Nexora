package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query(value = "SELECT * FROM order_items WHERE order_id = :orderId ORDER BY order_item_id DESC", nativeQuery = true)
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);

    @Query(value = "SELECT * FROM order_items WHERE variant_id = :variantId ORDER BY order_item_id DESC", nativeQuery = true)
    List<OrderItem> findByVariantId(@Param("variantId") Long variantId);

    @Query(value = "SELECT * FROM order_items WHERE order_item_id = :orderItemId AND order_id = :orderId", nativeQuery = true)
    Optional<OrderItem> findByOrderItemIdAndOrderId(@Param("orderItemId") Long orderItemId, @Param("orderId") Long orderId);

    @Modifying
    @Query(value = "DELETE FROM order_items WHERE order_id = :orderId", nativeQuery = true)
    void deleteByOrderId(@Param("orderId") Long orderId);

}