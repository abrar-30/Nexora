package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    Unit findById(long id);

    @Query(value = "SELECT * FROM units WHERE is_deleted = false", nativeQuery = true)
    List<Unit> findAllActiveUnits();

    @Modifying
    @Transactional
    @Query(value = "UPDATE units SET is_deleted = true WHERE unit_id = :id", nativeQuery = true)
    void softDeleteUnit(Long id);
}
