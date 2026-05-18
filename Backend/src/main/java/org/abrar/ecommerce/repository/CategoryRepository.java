package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByCategoryName(@Param("categoryName") String categoryName);

    @Query(value = "SELECT * FROM categories WHERE category_id = :categoryId", nativeQuery = true)
    Optional<Category> findByCategoryId(@Param("categoryId") Long categoryId);
}
