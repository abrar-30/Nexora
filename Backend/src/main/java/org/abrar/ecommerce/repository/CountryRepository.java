package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.dto.CountryDTO;
import org.abrar.ecommerce.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    boolean existsByCountryName(String countryName);

    List<Country> findAll();
}
