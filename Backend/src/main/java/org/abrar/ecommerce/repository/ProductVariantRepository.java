package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @Query(value = "SELECT * FROM product_variants WHERE product_variant_id = :id AND is_deleted = false", nativeQuery = true)
    Optional<ProductVariant> findByIdActive(@Param("id") Long id);

    @Query(value = "SELECT * FROM product_variants WHERE product_id = :productId AND is_deleted = false", nativeQuery = true)
    List<ProductVariant> findByProductIdActive(@Param("productId") Long productId);

    @Query(value = "SELECT * FROM product_variants WHERE product_id = :productId AND is_active = true AND is_deleted = false", nativeQuery = true)
    List<ProductVariant> findActiveVariantsByProductId(@Param("productId") Long productId);

    @Query(value = "SELECT * FROM product_variants WHERE item_code = :itemCode AND is_deleted = false", nativeQuery = true)
    Optional<ProductVariant> findByItemCode(@Param("itemCode") String itemCode);

    @Query(value = "SELECT * FROM product_variants WHERE is_active = true AND is_deleted = false", nativeQuery = true)
    List<ProductVariant> findAllActive();

    @Query(value = "SELECT * FROM product_variants WHERE is_deleted = false ORDER BY created_at DESC", nativeQuery = true)
    List<ProductVariant> findAllNotDeleted();

    @Query(value = "SELECT COUNT(*) > 0 FROM product_variants WHERE item_code = :itemCode AND product_variant_id != :id AND is_deleted = false", nativeQuery = true)
    boolean existsByItemCodeAndIdNot(@Param("itemCode") String itemCode, @Param("id") Long id);

    @Query(value = "SELECT COUNT(*) > 0 FROM product_variants WHERE item_code = :itemCode AND is_deleted = false", nativeQuery = true)
    boolean existsByItemCode(@Param("itemCode") String itemCode);

}
