package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(value = "SELECT * FROM products WHERE is_deleted = false", nativeQuery = true)
    List<Product> findAll();

    @Query(value = "SELECT * FROM products WHERE is_deleted = false and is_active=true", nativeQuery = true)
    List<Product> findAllActive();

    @Query(value = "SELECT p.* FROM products p " +
            "LEFT JOIN product_variants pv ON p.product_id = pv.product_id " +
            "LEFT JOIN categories c ON p.category_id = c.category_id " +
            "WHERE p.product_id = :id AND p.is_deleted = false", nativeQuery = true)
    Optional<Product> findProductDetailById(@Param("id") Long id);

    @Query(value = "SELECT p.* FROM products p " +
            "INNER JOIN brands b ON p.brand_id = b.brand_id " +
            "WHERE b.brand_id = :brandId AND p.is_deleted = false AND p.is_active = true", nativeQuery = true)
    List<Product> findByBrandId(@Param("brandId") Long brandId);

    @Query(value = "SELECT p.* FROM products p " +
            "WHERE p.item_code = :itemCode AND p.is_deleted = false", nativeQuery = true)
    Optional<Product> findByItemCode(@Param("itemCode") String itemCode);

    @Query(value = "SELECT p.* FROM products p " +
            "INNER JOIN categories c ON p.category_id = c.category_id " +
            "WHERE c.category_id = :categoryId AND p.is_deleted = false AND p.is_active = true", nativeQuery = true)
    List<Product> findByCategoryId(@Param("categoryId") Long categoryId);

    @Query(value = "SELECT p.* FROM products p " +
            "WHERE p.base_price BETWEEN :minPrice AND :maxPrice " +
            "AND p.is_deleted = false AND p.is_active = true", nativeQuery = true)
    List<Product> findByBasePriceBetween(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);

    @Query(value = "SELECT p.* FROM products p " +
            "WHERE LOWER(p.product_name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "AND p.is_deleted = false AND p.is_active = true", nativeQuery = true)
    List<Product> findByProductNameContainingIgnoreCase(@Param("keyword") String keyword);

    @Query(value = "SELECT p.* FROM products p " +
            "WHERE p.product_id = :productId AND p.is_deleted = false", nativeQuery = true)
    Optional<Product> findProductByProductId(@Param("productId") Long productId);

    @Query(value = "SELECT p.* FROM products p " +
            "LEFT JOIN product_variants pv ON p.product_id = pv.product_id " +
            "WHERE p.is_deleted = false AND p.is_active = true", nativeQuery = true)
    List<Product> findByBrand_BrandName(@Param("brandName") String brandName);

    @Query(value = "SELECT p.* FROM products p " +
            "INNER JOIN categories c ON p.category_id = c.category_id " +
            "WHERE c.category_name = :categoryName AND p.is_deleted = false AND p.is_active = true", nativeQuery = true)
    List<Product> findByCategory_CategoryName(@Param("categoryName") String categoryName);
}