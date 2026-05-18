package org.abrar.ecommerce.service.ProductReview;

import org.abrar.ecommerce.dto.ProductReviewDTO;

import java.util.List;

public interface ProductReviewService {
    ProductReviewDTO createReview(ProductReviewDTO reviewDTO);

    ProductReviewDTO getReviewById(Long reviewId);

    List<ProductReviewDTO> getReviewsByProductId(Long productId);

    List<ProductReviewDTO> getReviewsByUserId(Long userId);

    Double getAverageRatingByProductId(Long productId);

    ProductReviewDTO updateReview(Long reviewId, ProductReviewDTO reviewDTO);

    void deleteReview(Long reviewId);

    void markHelpful(Long reviewId);
}
