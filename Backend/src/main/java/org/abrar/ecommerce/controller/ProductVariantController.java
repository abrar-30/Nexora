package org.abrar.ecommerce.controller;

import jakarta.validation.Valid;
import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.ProductVariantDTO;
import org.abrar.ecommerce.dto.ProductVariantRequestDTO;
import org.abrar.ecommerce.service.ProductVariant.ProductVariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-variants")
@CrossOrigin(origins = "*")
public class ProductVariantController {

    @Autowired
    private ProductVariantService productVariantService;

    /**
     * Create a new product variant
     */
    @PostMapping("/create/{productId}")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequestDTO variantDTO) {
        ProductVariantDTO createdVariant = productVariantService.createVariant(productId, variantDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product variant created successfully", createdVariant));
    }

    /**
     * Get variant by ID
     */
    @GetMapping("/{variantId}")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> getVariantById(@PathVariable Long variantId) {
        ProductVariantDTO variant = productVariantService.getVariantById(variantId);
        return ResponseEntity.ok(ApiResponse.success("Product variant fetched successfully", variant));
    }

    /**
     * Get all variants for a product (including inactive)
     */
    @GetMapping("/product/{productId}/all")
    public ResponseEntity<ApiResponse<List<ProductVariantDTO>>> getVariantsByProductId(@PathVariable Long productId) {
        List<ProductVariantDTO> variants = productVariantService.getVariantsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Product variants fetched successfully", variants));
    }

    /**
     * Get only active variants for a product
     */
    @GetMapping("/product/{productId}/active")
    public ResponseEntity<ApiResponse<List<ProductVariantDTO>>> getActiveVariantsByProductId(@PathVariable Long productId) {
        List<ProductVariantDTO> variants = productVariantService.getActiveVariantsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Active product variants fetched successfully", variants));
    }

    /**
     * Update a product variant
     */
    @PutMapping("/update/{variantId}")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> updateVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequestDTO variantDTO) {
        ProductVariantDTO updatedVariant = productVariantService.updateVariant(variantId, variantDTO);
        return ResponseEntity.ok(ApiResponse.success("Product variant updated successfully", updatedVariant));
    }

    /**
     * Delete a product variant (soft delete)
     */
    @DeleteMapping("/delete/{variantId}")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable Long variantId) {
        productVariantService.deleteVariant(variantId);
        return ResponseEntity.ok(ApiResponse.success("Product variant deleted successfully", null));
    }

    /**
     * Get all variants (not deleted)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ProductVariantDTO>>> getAllVariants() {
        List<ProductVariantDTO> variants = productVariantService.getAllActiveVariants();
        return ResponseEntity.ok(ApiResponse.success("All active product variants fetched successfully", variants));
    }
}

