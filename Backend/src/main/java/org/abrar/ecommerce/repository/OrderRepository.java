package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(value = "SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC", nativeQuery = true)
    List<Order> findOrdersByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM orders WHERE order_number = :orderNumber", nativeQuery = true)
    Optional<Order> findByOrderNumber(@Param("orderNumber") String orderNumber);

    @Query(value = "SELECT * FROM orders WHERE order_id = :orderId AND user_id = :userId", nativeQuery = true)
    Optional<Order> findByOrderIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);

    @Query(value = "SELECT * FROM orders WHERE order_status = :status ORDER BY created_at DESC", nativeQuery = true)
    List<Order> findByOrderStatus(@Param("status") String status);

    @Query(value = "SELECT COUNT(1) >0 FROM orders WHERE order_number = :orderNumber", nativeQuery = true)
    boolean existsByOrderNumber(@Param("orderNumber") String orderNumber);
}