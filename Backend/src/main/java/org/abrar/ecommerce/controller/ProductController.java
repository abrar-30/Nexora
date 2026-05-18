package org.abrar.ecommerce.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.ProductRequestDTO;
import org.abrar.ecommerce.dto.ProductResponseDTO;
import org.abrar.ecommerce.service.Product.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction) {

        List<ProductResponseDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/getAllActive")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getAllActiveProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction) {

        List<ProductResponseDTO> products = productService.getAllActiveProducts();
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> getProduct(@PathVariable Long id) {
        ProductResponseDTO productDTO = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product fetched", productDTO));
    }

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getProductsByBrand(@PathVariable Long brandId) {
        List<ProductResponseDTO> products = productService.getProductsByBrandId(brandId);
        return ResponseEntity.ok(ApiResponse.success("Products fetched for brand: " + brandId, products));
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponseDTO>> createProduct(
            @RequestPart("requestDTO") String requestDTOJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws JsonProcessingException {

        ObjectMapper objectMapper = new ObjectMapper();
        ProductRequestDTO requestDTO = objectMapper.readValue(requestDTOJson, ProductRequestDTO.class);

        ProductResponseDTO productDTO = productService.createProduct(requestDTO, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", productDTO));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO requestDTO, MultipartFile imageFile) {
        ProductResponseDTO productDTO = productService.updateProduct(id, requestDTO, imageFile);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", productDTO));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductResponseDTO> products = productService.getProductsByCategoryId(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Products fetched for category: " + categoryId, products));
    }

    @GetMapping("/price-range")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getProductsByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        List<ProductResponseDTO> products = productService.getProductsByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(ApiResponse.success("Products fetched in price range", products));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> searchProducts(@RequestParam String keyword) {
        List<ProductResponseDTO> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(ApiResponse.success("Products searched successfully", products));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> toggleProductStatus(@PathVariable Long id, @RequestParam boolean active) {
        productService.updateStatus(id, active);
        return ResponseEntity.ok().build();
    }
}
