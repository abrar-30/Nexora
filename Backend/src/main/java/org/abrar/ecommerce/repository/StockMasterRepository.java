package org.abrar.ecommerce.repository;


import org.abrar.ecommerce.entity.StockMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StockMasterRepository extends JpaRepository<StockMaster, Long> {

    @Query(value = """
            SELECT COALESCE(SUM(quantity),0)
            FROM stock_master WHERE variant_id = :variantId AND quantity >0 AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
            """, nativeQuery = true)
    Double getAvailableQtyByVariantId(@Param("variantId") Long variantId);

    @Query(value = """
        SELECT *
        FROM stock_master 
        WHERE variant_id = :variantId 
        AND quantity > 0 
        AND (expiry_date IS NULL OR expiry_date >= :today)
        ORDER BY 
        CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END,
        expiry_date ASC,
        stock_id ASC 
        FOR UPDATE
        """, nativeQuery = true)
    List<StockMaster> findAvailableBatchesForUpdate(@Param("variantId") Long variantId,
                                                    @Param("today") LocalDate today);

    @Modifying
    @Query(value = """
            UPDATE stock_master SET quantity = :quantity,
            updated_at = NOW()
            WHERE stock_id = :stockId """, nativeQuery = true)
    void updateStockQuantity(@Param("stockId") Long stockId, @Param("quantity") Double quantity);

    @Query("SELECT s FROM StockMaster s WHERE s.variant.productVariantId = :variantId")
    List<StockMaster> findByVariantId(@Param("variantId") Long variantId);
}
