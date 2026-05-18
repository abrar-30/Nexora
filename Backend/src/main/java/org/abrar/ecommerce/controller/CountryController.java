package org.abrar.ecommerce.controller;

import jakarta.validation.Valid;
import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.CountryDTO;
import org.abrar.ecommerce.service.Country.CountryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/countries")
public class CountryController {

    @Autowired
    private CountryService countryService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CountryDTO>> createCountry(
            @Valid @RequestBody CountryDTO countryDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Country created", countryService.createCountry(countryDTO)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CountryDTO>> getCountryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Country fetched", countryService.getCountryById(id)));
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<CountryDTO>>> getAllCountries() {
        return ResponseEntity.ok(ApiResponse.success("Countries fetched", countryService.getAllCountries()));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<CountryDTO>> updateCountry(
            @PathVariable Long id,
            @Valid @RequestBody CountryDTO countryDTO) {
        return ResponseEntity.ok(ApiResponse.success("Country updated", countryService.updateCountry(id, countryDTO)));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCountry(@PathVariable Long id) {
        countryService.deleteCountry(id);
        return ResponseEntity.ok(ApiResponse.success("Country deleted", null));
    }
}