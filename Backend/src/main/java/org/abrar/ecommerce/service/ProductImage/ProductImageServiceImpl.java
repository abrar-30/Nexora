package org.abrar.ecommerce.service.ProductImage;

import org.abrar.ecommerce.dto.ProductImageDTO;
import org.abrar.ecommerce.dto.ProductImageRequestDTO;
import org.abrar.ecommerce.entity.ProductImage;
import org.abrar.ecommerce.entity.ProductVariant;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.ProductImageRepository;
import org.abrar.ecommerce.repository.ProductVariantRepository;
import org.abrar.ecommerce.service.Cloudinary.CloudinaryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductImageServiceImpl implements ProductImageService {
    private static final int MAX_IMAGES_PER_VARIANT = 10;

    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CloudinaryService cloudinaryService;

    public ProductImageServiceImpl(ProductImageRepository productImageRepository,
                                   ProductVariantRepository productVariantRepository,
                                   CloudinaryService cloudinaryService) {
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public ProductImageDTO uploadImage(Long variantId, MultipartFile file, ProductImageDTO imageDTO) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("ProductVariant not found with id: " + variantId));

        try {
            String imageUrl = cloudinaryService.uploadImage(file);

            ProductImage productImage = new ProductImage();
            productImage.setProductVariant(variant);
            productImage.setImageUrl(imageUrl);
            productImage.setDisplayOrder(imageDTO.getDisplayOrder());
            productImage.setIsPrimary(imageDTO.getIsPrimary());
            productImage.setIsActive(imageDTO.getIsActive());
            productImage.setIsDeleted(false);

            ProductImage savedImage = productImageRepository.save(productImage);
            return convertToDTO(savedImage);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public List<ProductImageDTO> uploadImages(Long variantId,
                                              List<MultipartFile> files,
                                              List<ProductImageRequestDTO> metadataList) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one image file is required");
        }

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found: " + variantId));

        // Validate max image count
        int existingCount = productImageRepository.countActiveByVariantId(variantId);
        if (existingCount + files.size() > MAX_IMAGES_PER_VARIANT) {
            throw new IllegalArgumentException(
                    "Cannot upload " + files.size() + " images. " +
                            "Variant already has " + existingCount + " images. " +
                            "Max allowed: " + MAX_IMAGES_PER_VARIANT
            );
        }

        boolean hasExistingImages = existingCount > 0;
        int nextDisplayOrder = productImageRepository.getMaxDisplayOrderByVariantId(variantId) + 1;


        List<ProductImageDTO> uploadedImages = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);

            // Get metadata for this file or use defaults
            ProductImageRequestDTO metadata = (metadataList != null && i < metadataList.size())
                    ? metadataList.get(i)
                    : new ProductImageRequestDTO();

            // First image is primary if no existing images and no explicit primary requested
            boolean isPrimary = Boolean.TRUE.equals(metadata.getIsPrimary())
                    || (!hasExistingImages && i == 0);

            // Auto assign display order if not provided
            int displayOrder = metadata.getDisplayOrder() != null
                    ? metadata.getDisplayOrder()
                    : nextDisplayOrder + i;

            try {
                String imageUrl = cloudinaryService.uploadImage(file);

                ProductImage productImage = new ProductImage();
                productImage.setProductVariant(variant);
                productImage.setImageUrl(imageUrl);
                productImage.setAltText(metadata.getAltText());
                productImage.setDisplayOrder(displayOrder);
                productImage.setIsPrimary(isPrimary);
                productImage.setIsActive(true);
                productImage.setIsDeleted(false);

                uploadedImages.add(convertToDTO(productImageRepository.save(productImage)));

            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image: " + file.getOriginalFilename(), e);
            }
        }

        return uploadedImages;
    }

    @Override
    public ProductImageDTO getImageById(Long imageId) {
        ProductImage image = productImageRepository.findByIdActive(imageId)
                .orElseThrow(() -> new RuntimeException("ProductImage not found with id: " + imageId));
        return convertToDTO(image);
    }

    @Override
    public List<ProductImageDTO> getImagesByVariantId(Long variantId) {
        return productImageRepository.findByVariantId(variantId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductImageDTO> getActiveImagesByVariantId(Long variantId) {
        return productImageRepository.findActiveImagesByVariantId(variantId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductImageDTO updateImage(Long imageId, ProductImageRequestDTO requestDTO) {
        ProductImage image = productImageRepository.findByIdActive(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage not found: " + imageId));

        // If updating to primary, unset existing primary first
        if (Boolean.TRUE.equals(requestDTO.getIsPrimary())) {
            unsetExistingPrimary(image.getProductVariant().getProductVariantId());
        }

        image.setDisplayOrder(requestDTO.getDisplayOrder());
        image.setIsPrimary(requestDTO.getIsPrimary() != null ? requestDTO.getIsPrimary() : false);
        image.setAltText(requestDTO.getAltText());
        image.setIsActive(requestDTO.getIsActive() != null ? requestDTO.getIsActive() : true);

        return convertToDTO(productImageRepository.save(image));
    }

    @Override
    public void deleteImage(Long imageId) {
        ProductImage image = productImageRepository.findByIdActive(imageId)
                .orElseThrow(() -> new RuntimeException("ProductImage not found with id: " + imageId));
        image.setIsDeleted(true);
        productImageRepository.save(image);
    }

    @Override
    public List<ProductImageDTO> getAllImages() {
        return productImageRepository.findAllNotDeleted()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void unsetExistingPrimary(Long variantId) {
        productImageRepository.findPrimaryImageByVariantId(variantId)
                .ifPresent(image -> {
                    image.setIsPrimary(false);
                    productImageRepository.save(image);
                });
    }

    private ProductImageDTO convertToDTO(ProductImage image) {
        ProductImageDTO dto = new ProductImageDTO();
        dto.setImageId(image.getProductImageId());
        dto.setImageUrl(image.getImageUrl());
        dto.setDisplayOrder(image.getDisplayOrder());
        dto.setIsPrimary(image.getIsPrimary());
        dto.setIsActive(image.getIsActive());
        dto.setCreatedAt(image.getCreatedAt());
        dto.setUpdatedAt(image.getUpdatedAt());
        return dto;
    }
}