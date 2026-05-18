package org.abrar.ecommerce.repository;

import org.abrar.ecommerce.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findByState_StateId(Long stateId);

    boolean existsByCityNameAndState_StateId(String cityName, Long stateId);
}
