package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.ProductImageDTO;
import org.abrar.ecommerce.dto.ProductImageRequestDTO;
import org.abrar.ecommerce.service.ProductImage.ProductImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-images")
@CrossOrigin(origins = "*")
public class ProductImageController {

    private final ProductImageService productImageService;
    private final ObjectMapper objectMapper;

    public ProductImageController(ProductImageService productImageService, ObjectMapper objectMapper) {
        this.productImageService = productImageService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/upload/{variantId}")
    public ResponseEntity<ProductImageDTO> uploadImage(@PathVariable Long variantId, MultipartFile file, @RequestBody ProductImageDTO imageDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productImageService.uploadImage(variantId, file, imageDTO));
    }


    @PostMapping(value = "/upload/multiple/{variantId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<ProductImageDTO>>> uploadImages(
            @PathVariable Long variantId,
            @RequestPart("files") List<MultipartFile> files,
            @RequestPart(value = "metadata", required = false) String metadataJson) throws Exception {

        List<ProductImageRequestDTO> metadataList = null;
        if (metadataJson != null) {
            metadataList = objectMapper.readValue(metadataJson,
                    objectMapper.getTypeFactory().constructCollectionType(
                            List.class, ProductImageRequestDTO.class));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Images uploaded successfully",
                        productImageService.uploadImages(variantId, files, metadataList)));
    }

    @GetMapping("/{imageId}")
    public ResponseEntity<ProductImageDTO> getImageById(@PathVariable Long imageId) {
        return ResponseEntity.ok(productImageService.getImageById(imageId));
    }

    @GetMapping("/variant/{variantId}")
    public ResponseEntity<List<ProductImageDTO>> getImagesByVariantId(@PathVariable Long variantId) {
        return ResponseEntity.ok(productImageService.getImagesByVariantId(variantId));
    }

    @GetMapping("/variant/{variantId}/active")
    public ResponseEntity<List<ProductImageDTO>> getActiveImagesByVariantId(@PathVariable Long variantId) {
        return ResponseEntity.ok(productImageService.getActiveImagesByVariantId(variantId));
    }

    @PutMapping("/{imageId}")
    public ResponseEntity<ProductImageDTO> updateImage(@PathVariable Long imageId, @RequestBody ProductImageRequestDTO imageDTO) {
        return ResponseEntity.ok(productImageService.updateImage(imageId, imageDTO));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        productImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductImageDTO>> getAllImages() {
        return ResponseEntity.ok(productImageService.getAllImages());
    }
}