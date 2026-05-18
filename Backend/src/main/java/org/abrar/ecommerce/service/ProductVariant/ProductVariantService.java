package org.abrar.ecommerce.service.ProductVariant;

import org.abrar.ecommerce.dto.ProductVariantDTO;
import org.abrar.ecommerce.dto.ProductVariantRequestDTO;
import org.abrar.ecommerce.entity.ProductVariant;

import java.util.List;
import java.util.Optional;

public interface ProductVariantService {
    ProductVariantDTO createVariant(Long productId, ProductVariantRequestDTO variantDTO);

    ProductVariantDTO getVariantById(Long variantId);

    Optional<ProductVariant> getvariantNameById(Long variantId);

    List<ProductVariantDTO> getVariantsByProductId(Long productId);

    List<ProductVariantDTO> getActiveVariantsByProductId(Long productId);

    ProductVariantDTO updateVariant(Long variantId, ProductVariantRequestDTO variantDTO);

    void deleteVariant(Long variantId);

    List<ProductVariantDTO> getAllActiveVariants();

    List<ProductVariant> getAllVariants();
}
