package org.abrar.ecommerce.controller;

import jakarta.validation.Valid;
import org.abrar.ecommerce.dto.AddressRequestDTO;
import org.abrar.ecommerce.dto.AddressResponseDTO;
import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.service.Address.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;


    private String getEmailFromToken() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<AddressResponseDTO>> createAddress(
            @Valid @RequestBody AddressRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address created",
                        addressService.createAddress(requestDTO, getEmailFromToken())));
    }

    @GetMapping("/my-addresses")
    public ResponseEntity<ApiResponse<List<AddressResponseDTO>>> getMyAddresses() {
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched",
                addressService.getAllAddressesByUser(getEmailFromToken())));
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponseDTO>> getAddressById(
            @PathVariable Long addressId) {
        return ResponseEntity.ok(ApiResponse.success("Address fetched",
                addressService.getAddressById(addressId, getEmailFromToken())));
    }

    @PutMapping("/update/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponseDTO>> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequestDTO requestDTO) {
        return ResponseEntity.ok(ApiResponse.success("Address updated",
                addressService.updateAddress(addressId, requestDTO, getEmailFromToken())));
    }

    @DeleteMapping("/delete/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Long addressId) {
        addressService.deleteAddress(addressId, getEmailFromToken());
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @PatchMapping("/set-default/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponseDTO>> setDefaultAddress(
            @PathVariable Long addressId) {
        return ResponseEntity.ok(ApiResponse.success("Default address updated",
                addressService.setDefaultAddress(addressId, getEmailFromToken())));
    }
}
