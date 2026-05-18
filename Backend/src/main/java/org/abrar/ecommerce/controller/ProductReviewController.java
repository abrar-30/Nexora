package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.ProductReviewDTO;
import org.abrar.ecommerce.service.ProductReview.ProductReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    public ProductReviewController(ProductReviewService productReviewService) {
        this.productReviewService = productReviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createReview(@RequestBody ProductReviewDTO reviewDTO) {
        log.info("Creating review for product: {}", reviewDTO.getProductId());
        try {
            ProductReviewDTO createdReview = productReviewService.createReview(reviewDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Review created successfully", createdReview));

        } catch (Exception e) {
            log.error("Error creating review", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error creating review", e.getMessage()));
        }
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse> getReviewById(@PathVariable Long reviewId) {
        log.info("Fetching review with id: {}", reviewId);
        try {
            ProductReviewDTO review = productReviewService.getReviewById(reviewId);
            return ResponseEntity.ok(ApiResponse.success("Review found", review));
        } catch (Exception e) {
            log.error("Error fetching review", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Error fetching review", e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse> getReviewsByProductId(@PathVariable Long productId) {
        log.info("Fetching reviews for product: {}", productId);
        try {
            List<ProductReviewDTO> reviews = productReviewService.getReviewsByProductId(productId);
            return ResponseEntity.ok(ApiResponse.success("Reviews found", reviews));
        } catch (Exception e) {
            log.error("Error fetching reviews for product", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error fetching reviews for product", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getReviewsByUserId(@PathVariable Long userId) {
        log.info("Fetching reviews for user: {}", userId);
        try {
            List<ProductReviewDTO> reviews = productReviewService.getReviewsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("Reviews found", reviews));
        } catch (Exception e) {
            log.error("Error fetching user reviews", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error fetching reviews for user", e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}/average-rating")
    public ResponseEntity<ApiResponse> getAverageRatingByProductId(@PathVariable Long productId) {
        log.info("Fetching average rating for product: {}", productId);
        try {
            Double averageRating = productReviewService.getAverageRatingByProductId(productId);
            return ResponseEntity.ok(ApiResponse.success("average rating", averageRating));
        } catch (Exception e) {
            log.error("Error fetching average rating", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error fetching average rating", e.getMessage()));
        }
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse> updateReview(@PathVariable Long reviewId,
                                                    @RequestBody ProductReviewDTO reviewDTO) {
        log.info("Updating review with id: {}", reviewId);
        try {
            ProductReviewDTO updatedReview = productReviewService.updateReview(reviewId, reviewDTO);
            return ResponseEntity.ok(ApiResponse.success("Review updated successfully", updatedReview));
        } catch (Exception e) {
            log.error("Error updating review", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error updating review", e.getMessage()));
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long reviewId) {
        log.info("Deleting review with id: {}", reviewId);
        try {
            productReviewService.deleteReview(reviewId);
            return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting review", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error deleting review", e.getMessage()));
        }
    }

    @PostMapping("/{reviewId}/mark-helpful")
    public ResponseEntity<ApiResponse> markHelpful(@PathVariable Long reviewId) {
        log.info("Marking review as helpful: {}", reviewId);
        try {
            productReviewService.markHelpful(reviewId);
            return ResponseEntity.ok(ApiResponse.success("Review marked as helpful", null));
        } catch (Exception e) {
            log.error("Error marking review as helpful", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error marking review", e.getMessage()));
        }
    }
}

