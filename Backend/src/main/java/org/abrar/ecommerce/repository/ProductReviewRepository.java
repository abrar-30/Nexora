package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    @Query(value = "SELECT * FROM product_reviews WHERE product_id = :productId ORDER BY created_at DESC", nativeQuery = true)
    List<ProductReview> findReviewsByProductId(@Param("productId") Long productId);

    @Query(value = "SELECT * FROM product_reviews WHERE user_id = :userId ORDER BY created_at DESC", nativeQuery = true)
    List<ProductReview> findReviewsByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT AVG(rating) FROM product_reviews WHERE product_id = :productId", nativeQuery = true)
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query(value = "SELECT * FROM product_reviews WHERE product_id = :productId AND is_verified_purchase = true ORDER BY created_at DESC", nativeQuery = true)
    List<ProductReview> findVerifiedReviewsByProductId(@Param("productId") Long productId);

    @Query(value = "SELECT * FROM product_reviews WHERE product_id = :productId ORDER BY helpful_count DESC LIMIT :limit", nativeQuery = true)
    List<ProductReview> findTopHelpfulReviews(@Param("productId") Long productId, @Param("limit") int limit);
}