package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.TaxSlabDTO;
import org.abrar.ecommerce.service.TaxSlab.TaxSlabService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/taxslabs")
@CrossOrigin(origins = "*")
public class TaxSlabController {

    @Autowired
    private TaxSlabService taxSlabService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaxSlabDTO>> createTaxSlab(@RequestBody TaxSlabDTO taxSlabDTO) {
        return ResponseEntity.ok(ApiResponse.success("Tax slab created successfully",
                taxSlabService.createTaxSlab(taxSlabDTO)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxSlabDTO>> getTaxSlabById(@PathVariable("id") Long taxSlabId) {
        return ResponseEntity.ok(ApiResponse.success("Tax slab fetched",
                taxSlabService.getTaxSlabById(taxSlabId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaxSlabDTO>>> getAllTaxSlabs() {
        return ResponseEntity.ok(ApiResponse.success("All tax slabs fetched",
                taxSlabService.getAllTaxSlabs()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxSlabDTO>> updateTaxSlab(
            @PathVariable("id") Long taxSlabId,
            @RequestBody TaxSlabDTO taxSlabDTO) {
        return ResponseEntity.ok(ApiResponse.success("Tax slab updated successfully",
                taxSlabService.updateTaxSlab(taxSlabId, taxSlabDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTaxSlab(@PathVariable("id") Long taxSlabId) {
        taxSlabService.deleteTaxSlab(taxSlabId);
        return ResponseEntity.ok(ApiResponse.success("Tax slab deleted successfully", null));
    }
}