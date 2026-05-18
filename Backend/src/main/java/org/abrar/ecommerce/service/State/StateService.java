package org.abrar.ecommerce.service.State;

import org.abrar.ecommerce.dto.StateDTO;

import java.util.List;

public interface StateService {
    StateDTO createState(StateDTO stateDTO);

    StateDTO getStateById(Long id);

    List<StateDTO> getAllStates();

    List<StateDTO> getStatesByCountryId(Long countryId);

    StateDTO updateState(Long id, StateDTO stateDTO);

    void deleteState(Long id);
}
