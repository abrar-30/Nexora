package org.abrar.ecommerce.service.Country;

import org.abrar.ecommerce.dto.CountryDTO;

import java.util.List;

public interface CountryService {
    CountryDTO createCountry(CountryDTO countryDTO);

    CountryDTO getCountryById(Long id);

    List<CountryDTO> getAllCountries();

    CountryDTO updateCountry(Long id, CountryDTO countryDTO);

    void deleteCountry(Long id);
}
