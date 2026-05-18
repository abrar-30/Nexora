package org.abrar.ecommerce.service.State;

import jakarta.transaction.Transactional;
import org.abrar.ecommerce.dto.StateDTO;
import org.abrar.ecommerce.entity.Country;
import org.abrar.ecommerce.entity.State;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.CountryRepository;
import org.abrar.ecommerce.repository.StateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StateServiceImpl implements StateService {

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Override
    public StateDTO createState(StateDTO stateDTO) {
        Country country = countryRepository.findById(stateDTO.getCountryId())
                .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + stateDTO.getCountryId()));

        if (stateRepository.existsByStateNameAndCountry_CountryId(
                stateDTO.getStateName(), stateDTO.getCountryId())) {
            throw new IllegalArgumentException("State already exists in this country: " + stateDTO.getStateName());
        }

        State state = new State();
        state.setStateName(stateDTO.getStateName());
        state.setCountry(country);
        return convertToDTO(stateRepository.save(state));
    }

    @Override
    public StateDTO getStateById(Long id) {
        State state = stateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("State not found: " + id));
        return convertToDTO(state);
    }

    @Override
    public List<StateDTO> getAllStates() {
        return stateRepository.findAll()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<StateDTO> getStatesByCountryId(Long countryId) {
        return stateRepository.findByCountry_CountryId(countryId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public StateDTO updateState(Long id, StateDTO stateDTO) {
        State state = stateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("State not found: " + id));

        if (stateDTO.getCountryId() != null) {
            Country country = countryRepository.findById(stateDTO.getCountryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + stateDTO.getCountryId()));
            state.setCountry(country);
        }

        state.setStateName(stateDTO.getStateName());
        return convertToDTO(stateRepository.save(state));
    }

    @Override
    public void deleteState(Long id) {
        State state = stateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("State not found: " + id));
        stateRepository.delete(state);
    }

    private StateDTO convertToDTO(State state) {
        StateDTO dto = new StateDTO();
        dto.setStateId(state.getStateId());
        dto.setStateName(state.getStateName());
        dto.setCountryId(state.getCountry().getCountryId());
        dto.setCountryName(state.getCountry().getCountryName());
        return dto;
    }
}
