package org.abrar.ecommerce.controller;

import jakarta.validation.Valid;
import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.CityDTO;
import org.abrar.ecommerce.service.City.CityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cities")
public class CityController {

    @Autowired
    private CityService cityService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CityDTO>> createCity(
            @Valid @RequestBody CityDTO cityDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("City created", cityService.createCity(cityDTO)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CityDTO>> getCityById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("City fetched", cityService.getCityById(id)));
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<CityDTO>>> getAllCities() {
        return ResponseEntity.ok(ApiResponse.success("Cities fetched", cityService.getAllCities()));
    }

    @GetMapping("/state/{stateId}")
    public ResponseEntity<ApiResponse<List<CityDTO>>> getCitiesByStateId(
            @PathVariable Long stateId) {
        return ResponseEntity.ok(ApiResponse.success("Cities fetched for state",
                cityService.getCitiesByStateId(stateId)));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<CityDTO>> updateCity(
            @PathVariable Long id,
            @Valid @RequestBody CityDTO cityDTO) {
        return ResponseEntity.ok(ApiResponse.success("City updated", cityService.updateCity(id, cityDTO)));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCity(@PathVariable Long id) {
        cityService.deleteCity(id);
        return ResponseEntity.ok(ApiResponse.success("City deleted", null));
    }
}
