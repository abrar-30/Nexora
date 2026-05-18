package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StateRepository extends JpaRepository<State, Long> {
    List<State> findByCountry_CountryId(Long countryId);

    boolean existsByStateNameAndCountry_CountryId(String stateName, Long countryId);
}
