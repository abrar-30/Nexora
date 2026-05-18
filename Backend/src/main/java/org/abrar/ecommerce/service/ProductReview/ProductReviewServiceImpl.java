package org.abrar.ecommerce.service.ProductReview;

import org.abrar.ecommerce.dto.ProductReviewDTO;
import org.abrar.ecommerce.entity.Product;
import org.abrar.ecommerce.entity.ProductReview;
import org.abrar.ecommerce.entity.User;
import org.abrar.ecommerce.repository.ProductRepository;
import org.abrar.ecommerce.repository.ProductReviewRepository;
import org.abrar.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductReviewServiceImpl(ProductReviewRepository productReviewRepository,
                                    ProductRepository productRepository,
                                    UserRepository userRepository) {
        this.productReviewRepository = productReviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ProductReviewDTO createReview(ProductReviewDTO reviewDTO) {
        Product product = productRepository.findById(reviewDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + reviewDTO.getProductId()));

        User user = userRepository.findById(reviewDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + reviewDTO.getUserId()));

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setTitle(reviewDTO.getTitle());
        review.setReviewText(reviewDTO.getReviewText());
        review.setRating(reviewDTO.getRating());
        review.setIsVerifiedPurchase(false);
        review.setHelpfulCount(0);

        ProductReview savedReview = productReviewRepository.save(review);
        return convertToDTO(savedReview);
    }

    @Override
    public ProductReviewDTO getReviewById(Long reviewId) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        return convertToDTO(review);
    }

    @Override
    public List<ProductReviewDTO> getReviewsByProductId(Long productId) {
        return productReviewRepository.findReviewsByProductId(productId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductReviewDTO> getReviewsByUserId(Long userId) {
        return productReviewRepository.findReviewsByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageRatingByProductId(Long productId) {
        return productReviewRepository.getAverageRatingByProductId(productId);
    }

    @Override
    public ProductReviewDTO updateReview(Long reviewId, ProductReviewDTO reviewDTO) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));

        review.setTitle(reviewDTO.getTitle());
        review.setReviewText(reviewDTO.getReviewText());
        review.setRating(reviewDTO.getRating());

        ProductReview updatedReview = productReviewRepository.save(review);
        return convertToDTO(updatedReview);
    }

    @Override
    public void deleteReview(Long reviewId) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        productReviewRepository.delete(review);
    }

    @Override
    public void markHelpful(Long reviewId) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        productReviewRepository.save(review);
    }

    private ProductReviewDTO convertToDTO(ProductReview review) {
        ProductReviewDTO dto = new ProductReviewDTO();
        dto.setReviewId(review.getReviewId());
        dto.setProductId(review.getProduct().getProductId());
        dto.setUserId(review.getUser().getUserId());
        dto.setTitle(review.getTitle());
        dto.setReviewText(review.getReviewText());
        dto.setRating(review.getRating());
        dto.setIsVerifiedPurchase(review.getIsVerifiedPurchase());
        dto.setHelpfulCount(review.getHelpfulCount());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        return dto;
    }
}