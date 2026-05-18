package org.abrar.ecommerce.service.ProductImage;

import org.abrar.ecommerce.dto.ProductImageDTO;
import org.abrar.ecommerce.dto.ProductImageRequestDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    ProductImageDTO uploadImage(Long variantId, MultipartFile file, ProductImageDTO imageDTO);

    List<ProductImageDTO> uploadImages(Long variantId, List<MultipartFile> files, List<ProductImageRequestDTO> metadataList);

    ProductImageDTO getImageById(Long imageId);

    List<ProductImageDTO> getImagesByVariantId(Long variantId);

    List<ProductImageDTO> getActiveImagesByVariantId(Long variantId);

    ProductImageDTO updateImage(Long imageId, ProductImageRequestDTO requestDTO);

    void deleteImage(Long imageId);

    List<ProductImageDTO> getAllImages();
}