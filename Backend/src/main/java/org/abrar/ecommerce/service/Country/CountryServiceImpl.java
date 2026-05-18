package org.abrar.ecommerce.service.Country;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.abrar.ecommerce.dto.CountryDTO;
import org.abrar.ecommerce.entity.Country;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class CountryServiceImpl implements CountryService {

    @Autowired
    private CountryRepository countryRepository;

    @Override
    public CountryDTO createCountry(CountryDTO countryDTO) {
        if (countryRepository.existsByCountryName(countryDTO.getCountryName())) {
            throw new IllegalArgumentException("Country already exists: " + countryDTO.getCountryName());
        }
        Country country = new Country();
        country.setCountryName(countryDTO.getCountryName());
        log.debug("Creating country: {}", countryDTO.getCountryName());
        return convertToDTO(countryRepository.save(country));
    }

    @Override

    public CountryDTO getCountryById(Long id) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + id));
        return convertToDTO(country);
    }

    @Override
    public List<CountryDTO> getAllCountries() {
        return countryRepository.findAll()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public CountryDTO updateCountry(Long id, CountryDTO countryDTO) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + id));
        country.setCountryName(countryDTO.getCountryName());
        return convertToDTO(countryRepository.save(country));
    }

    @Override
    public void deleteCountry(Long id) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + id));
        countryRepository.delete(country);
    }

    private CountryDTO convertToDTO(Country country) {
        CountryDTO dto = new CountryDTO();
        dto.setCountryId(country.getCountryId());
        dto.setCountryName(country.getCountryName());
        return dto;
    }
}
