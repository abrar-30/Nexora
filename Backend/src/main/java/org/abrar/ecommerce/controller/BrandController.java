package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.BrandDTO;
import org.abrar.ecommerce.service.Brand.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@CrossOrigin(origins = "*")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @PostMapping
    public ResponseEntity<ApiResponse<BrandDTO>> createBrand(@RequestBody BrandDTO brandDTO) {
        return ResponseEntity.ok(ApiResponse.success("Brand created successfully",
                brandService.createBrand(brandDTO)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandDTO>> getBrandById(@PathVariable("id") Long brandId) {
        return ResponseEntity.ok(ApiResponse.success("Brand fetched",
                brandService.getBrandById(brandId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandDTO>>> getAllBrands() {
        return ResponseEntity.ok(ApiResponse.success("All brands fetched",
                brandService.getAllBrands()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandDTO>> updateBrand(
            @PathVariable("id") Long brandId,
            @RequestBody BrandDTO brandDTO) {
        return ResponseEntity.ok(ApiResponse.success("Brand updated successfully",
                brandService.updateBrand(brandId, brandDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable("id") Long brandId) {
        brandService.deleteBrand(brandId);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully", null));
    }
}