package org.abrar.ecommerce.service.City;

import jakarta.transaction.Transactional;
import org.abrar.ecommerce.dto.CityDTO;
import org.abrar.ecommerce.entity.City;
import org.abrar.ecommerce.entity.State;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.CityRepository;
import org.abrar.ecommerce.repository.StateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CityServiceImpl implements CityService {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private StateRepository stateRepository;

    @Override
    public CityDTO createCity(CityDTO cityDTO) {
        State state = stateRepository.findById(cityDTO.getStateId())
                .orElseThrow(() -> new ResourceNotFoundException("State not found: " + cityDTO.getStateId()));

        if (cityRepository.existsByCityNameAndState_StateId(
                cityDTO.getCityName(), cityDTO.getStateId())) {
            throw new IllegalArgumentException("City already exists in this state: " + cityDTO.getCityName());
        }

        City city = new City();
        city.setCityName(cityDTO.getCityName());
        city.setState(state);
        return convertToDTO(cityRepository.save(city));
    }

    @Override
    public CityDTO getCityById(Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + id));
        return convertToDTO(city);
    }

    @Override
    public List<CityDTO> getAllCities() {
        return cityRepository.findAll()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CityDTO> getCitiesByStateId(Long stateId) {
        return cityRepository.findByState_StateId(stateId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public CityDTO updateCity(Long id, CityDTO cityDTO) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + id));

        if (cityDTO.getStateId() != null) {
            State state = stateRepository.findById(cityDTO.getStateId())
                    .orElseThrow(() -> new ResourceNotFoundException("State not found: " + cityDTO.getStateId()));
            city.setState(state);
        }

        city.setCityName(cityDTO.getCityName());
        return convertToDTO(cityRepository.save(city));
    }

    @Override
    public void deleteCity(Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + id));
        cityRepository.delete(city);
    }

    private CityDTO convertToDTO(City city) {
        CityDTO dto = new CityDTO();
        dto.setCityId(city.getCityId());
        dto.setCityName(city.getCityName());
        dto.setStateId(city.getState().getStateId());
        dto.setStateName(city.getState().getStateName());
        dto.setCountryName(city.getState().getCountry().getCountryName());
        return dto;
    }
}
