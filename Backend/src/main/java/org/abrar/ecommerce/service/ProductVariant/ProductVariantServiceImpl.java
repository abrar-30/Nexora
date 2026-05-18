package org.abrar.ecommerce.service.ProductVariant;

import lombok.extern.slf4j.Slf4j;
import org.abrar.ecommerce.dto.*;
import org.abrar.ecommerce.entity.Product;
import org.abrar.ecommerce.entity.ProductImage;
import org.abrar.ecommerce.entity.ProductVariant;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.ProductRepository;
import org.abrar.ecommerce.repository.ProductVariantRepository;
import org.abrar.ecommerce.repository.TaxSlabRepository;
import org.abrar.ecommerce.service.StockMaster.StockMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class ProductVariantServiceImpl implements ProductVariantService {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockMasterService stockMasterService;

    @Autowired
    private TaxSlabRepository taxSlabRepository;

    @Override
    public ProductVariantDTO createVariant(Long productId, ProductVariantRequestDTO variantDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));


        // Check if item code already exists
        if (productVariantRepository.existsByItemCode(variantDTO.getItemCode())) {
            throw new IllegalArgumentException("Item code already exists: " + variantDTO.getItemCode());
        }

        // Create variant
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setItemCode(variantDTO.getItemCode());
        variant.setProductVariantName(variantDTO.getVariantName());
        variant.setShortDescription(variantDTO.getShortDescription());
        variant.setDetailedDescription(variantDTO.getDetailedDescription());
        variant.setVariantPrice(variantDTO.getVariantPrice());
        variant.setLandingCost(variantDTO.getLandingCost());
        variant.setMrp(variantDTO.getMrp());
        variant.setPurchasePrice(variantDTO.getPurchasePrice());
        variant.setIsActive(true);
        variant.setIsDeleted(false);

        ProductVariant savedVariant = productVariantRepository.save(variant);

        StockMasterRequestDTO stockMasterDTO = new StockMasterRequestDTO();
        stockMasterDTO.setVariantId(savedVariant.getProductVariantId());
        stockMasterDTO.setQuantity(variantDTO.getQuantity());
        stockMasterDTO.setExpiryDate(variantDTO.getExpiryDate());

        stockMasterService.createStock(stockMasterDTO);


        return convertToDTO(savedVariant);
    }


    @Override
    public ProductVariantDTO getVariantById(Long variantId) {
        ProductVariant variant = productVariantRepository.findByIdActive(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));
        return convertToDTO(variant);
    }

    @Override
    public Optional<ProductVariant> getvariantNameById(Long variantId) {
        return productVariantRepository.findById(variantId);
    }

    @Override
    public List<ProductVariantDTO> getVariantsByProductId(Long productId) {
        // Validate product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        List<ProductVariant> variants = productVariantRepository.findByProductIdActive(productId);
        return variants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductVariantDTO> getActiveVariantsByProductId(Long productId) {
        // Validate product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        List<ProductVariant> variants = productVariantRepository.findActiveVariantsByProductId(productId);
        return variants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductVariantDTO updateVariant(Long variantId, ProductVariantRequestDTO variantDTO) {
        ProductVariant variant = productVariantRepository.findByIdActive(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));

        // Check if item code is being changed and if new item code already exists
        if (!variant.getItemCode().equals(variantDTO.getItemCode()) &&
                productVariantRepository.existsByItemCode(variantDTO.getItemCode())) {
            throw new IllegalArgumentException("Item code already exists: " + variantDTO.getItemCode());
        }

        variant.setItemCode(variantDTO.getItemCode());
        variant.setProductVariantName(variantDTO.getVariantName());
        if (variantDTO.getIsActive() != null) {
            variant.setIsActive(variantDTO.getIsActive());
        }


        variant.setShortDescription(variantDTO.getShortDescription());
        variant.setDetailedDescription(variantDTO.getDetailedDescription());
        variant.setVariantPrice(variantDTO.getVariantPrice());
        variant.setLandingCost(variantDTO.getLandingCost());
        variant.setMrp(variantDTO.getMrp());
        variant.setPurchasePrice(variantDTO.getPurchasePrice());

        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return convertToDTO(updatedVariant);
    }

    @Override
    public void deleteVariant(Long variantId) {
        ProductVariant variant = productVariantRepository.findByIdActive(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));

        variant.setIsDeleted(true);
        productVariantRepository.save(variant);
    }

    @Override
    public List<ProductVariant> getAllVariants() {
        return productVariantRepository.findAllNotDeleted();
    }

    public List<ProductVariantDTO> getAllActiveVariants() {
        List<ProductVariant> variants = productVariantRepository.findAllActive();
        return variants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductVariantDTO convertToDTO(ProductVariant variant) {
        ProductVariantDTO dto = new ProductVariantDTO();
        dto.setVariantId(variant.getProductVariantId());
        dto.setProductId(variant.getProduct().getProductId());
        dto.setItemCode(variant.getItemCode());
        dto.setVariantName(variant.getProductVariantName());
        dto.setShortDescription(variant.getShortDescription());
        dto.setDetailedDescription(variant.getDetailedDescription());
        dto.setLandingCost(variant.getLandingCost());
        dto.setMrp(variant.getMrp());
        dto.setPurchasePrice(variant.getPurchasePrice());
        dto.setVariantPrice(variant.getVariantPrice());
        dto.setIsActive(variant.getIsActive());
        dto.setIsDeleted(variant.getIsDeleted());
        dto.setCreatedAt(variant.getCreatedAt());
        dto.setUpdatedAt(variant.getUpdatedAt());

        // Convert product images if present
        if (variant.getProductImages() != null && !variant.getProductImages().isEmpty()) {
            dto.setProductImages(variant.getProductImages().stream()
                    .map(this::convertProductImageToDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private ProductImageDTO convertProductImageToDTO(ProductImage image) {
        ProductImageDTO dto = new ProductImageDTO();
        dto.setImageId(image.getProductImageId());
        dto.setProductVariantId(image.getProductVariant().getProductVariantId());
        dto.setImageUrl(image.getImageUrl());
        dto.setDisplayOrder(image.getDisplayOrder());
        dto.setIsPrimary(image.getIsPrimary());
        dto.setIsActive(image.getIsActive());
        dto.setCreatedAt(image.getCreatedAt());
        dto.setUpdatedAt(image.getUpdatedAt());
        return dto;
    }


}

