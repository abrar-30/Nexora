package org.abrar.ecommerce.service.City;

import org.abrar.ecommerce.dto.CityDTO;

import java.util.List;

public interface CityService {
    CityDTO createCity(CityDTO cityDTO);

    CityDTO getCityById(Long id);

    List<CityDTO> getAllCities();

    List<CityDTO> getCitiesByStateId(Long stateId);

    CityDTO updateCity(Long id, CityDTO cityDTO);

    void deleteCity(Long id);
}
