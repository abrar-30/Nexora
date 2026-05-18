package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.TaxSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxSlabRepository extends JpaRepository<TaxSlab, Long> {
    TaxSlab findById(long id);
}
