package org.abrar.ecommerce.controller;

import jakarta.validation.Valid;
import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.StateDTO;
import org.abrar.ecommerce.service.State.StateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/states")
public class StateController {

    @Autowired
    private StateService stateService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<StateDTO>> createState(
            @Valid @RequestBody StateDTO stateDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("State created", stateService.createState(stateDTO)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StateDTO>> getStateById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("State fetched", stateService.getStateById(id)));
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<StateDTO>>> getAllStates() {
        return ResponseEntity.ok(ApiResponse.success("States fetched", stateService.getAllStates()));
    }

    @GetMapping("/country/{countryId}")
    public ResponseEntity<ApiResponse<List<StateDTO>>> getStatesByCountryId(
            @PathVariable Long countryId) {
        return ResponseEntity.ok(ApiResponse.success("States fetched for country",
                stateService.getStatesByCountryId(countryId)));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<StateDTO>> updateState(
            @PathVariable Long id,
            @Valid @RequestBody StateDTO stateDTO) {
        return ResponseEntity.ok(ApiResponse.success("State updated", stateService.updateState(id, stateDTO)));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteState(@PathVariable Long id) {
        stateService.deleteState(id);
        return ResponseEntity.ok(ApiResponse.success("State deleted", null));
    }
}
