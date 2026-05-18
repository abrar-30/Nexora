package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    @Query(value = "SELECT * FROM addresses WHERE address_id = :id AND is_deleted = false", nativeQuery = true)
    Optional<Address> findByIdAndNotDeleted(@Param("id") Long id);

    @Query(value = "SELECT * FROM addresses WHERE user_id = :userId AND is_deleted = false ORDER BY is_default DESC, created_at DESC", nativeQuery = true)
    List<Address> findByUserAndNotDeleted(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM addresses WHERE user_id = :userId AND is_default = true AND is_deleted = false LIMIT 1", nativeQuery = true)
    Optional<Address> findDefaultAddressByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT COUNT(*) FROM addresses WHERE user_id = :userId AND is_deleted = false", nativeQuery = true)
    int countByUserId(@Param("userId") Long userId);
}
