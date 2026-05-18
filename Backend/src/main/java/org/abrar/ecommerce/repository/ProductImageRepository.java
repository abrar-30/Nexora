package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    @Query(value = "SELECT * FROM product_images WHERE product_image_id = :id AND is_deleted = false", nativeQuery = true)
    Optional<ProductImage> findByIdActive(@Param("id") Long id);

    @Query(value = "SELECT * FROM product_images WHERE product_variant_id = :variantId AND is_deleted = false ORDER BY display_order ASC", nativeQuery = true)
    List<ProductImage> findByVariantId(@Param("variantId") Long variantId);

    @Query(value = "SELECT * FROM product_images WHERE product_variant_id = :variantId AND is_active = true AND is_deleted = false ORDER BY display_order ASC", nativeQuery = true)
    List<ProductImage> findActiveImagesByVariantId(@Param("variantId") Long variantId);

    @Query(value = "SELECT * FROM product_images WHERE product_variant_id = :variantId AND is_primary = true AND is_deleted = false LIMIT 1", nativeQuery = true)
    Optional<ProductImage> findPrimaryImageByVariantId(@Param("variantId") Long variantId);

    @Query(value = "SELECT * FROM product_images WHERE is_deleted = false ORDER BY created_at DESC", nativeQuery = true)
    List<ProductImage> findAllNotDeleted();

    @Query(value = "SELECT COUNT(*) FROM product_images WHERE product_variant_id = :variantId AND is_deleted = false", nativeQuery = true)
    int countActiveByVariantId(@Param("variantId") Long variantId);

    @Query(value = "SELECT COALESCE(MAX(display_order), 0) FROM product_images WHERE product_variant_id = :variantId AND is_deleted = false", nativeQuery = true)
    int getMaxDisplayOrderByVariantId(@Param("variantId") Long variantId);
}