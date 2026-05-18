package org.abrar.ecommerce.service.Product;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.abrar.ecommerce.dto.ProductRequestDTO;
import org.abrar.ecommerce.dto.ProductResponseDTO;
import org.abrar.ecommerce.dto.ProductVariantDTO;
import org.abrar.ecommerce.dto.ProductVariantRequestDTO;
import org.abrar.ecommerce.entity.*;
import org.abrar.ecommerce.exception.CategoryNotFoundException;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.*;
import org.abrar.ecommerce.service.Cloudinary.CloudinaryService;
import org.abrar.ecommerce.service.ProductVariant.ProductVariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockMasterRepository stockMasterRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private TaxSlabRepository taxSlabRepository;

    @Autowired
    private ProductVariantService productVariantService;

    @Override
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getAllActiveProducts() {
        return productRepository.findAllActive().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getProductsByBrandId(Long brandId) {
        List<Product> products = productRepository.findByBrandId(brandId);
        if (products.isEmpty()) {
            throw new ResourceNotFoundException("No products found with brand: " + brandId);
        }
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }


    @Override
    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO requestDTO, MultipartFile imageFile) {
        Product product = new Product();
        product.setProductName(requestDTO.getProductName());
        product.setProductDisplayName(requestDTO.getProductDisplayName());
        product.setDescription(requestDTO.getDescription());
        product.setBasePrice(requestDTO.getBasePrice());
        product.setMrp(requestDTO.getMrp());
        product.setPurchasePrice(requestDTO.getPurchasePrice());
        product.setLandingCost(requestDTO.getLandingCost());
        product.setIsActive(true);
        product.setIsDeleted(false);

        // Upload image to Cloudinary if provided, otherwise use URL from DTO
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadImage(imageFile);
                product.setMainImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image to Cloudinary", e);
            }
        } else {
            product.setMainImageUrl(requestDTO.getMainImageUrl());
        }

        if (requestDTO.getBrandId() != null) {
            Brand brand = (Brand) brandRepository.findById(requestDTO.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + requestDTO.getBrandId()));
            product.setBrand(brand);
            log.debug("brand found: {}", brand.getBrandName());
        }

        Category category = categoryRepository.findByCategoryId(requestDTO.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + requestDTO.getCategoryId()));
        product.setCategory(category);

        if (requestDTO.getUnitId() != null) {
            Unit unit = (Unit) unitRepository.findById(requestDTO.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found with ID: " + requestDTO.getUnitId()));
            product.setUnit(unit);
        }

        if (requestDTO.getTaxSlabId() != null) {
            TaxSlab taxSlab = taxSlabRepository.findById(requestDTO.getTaxSlabId())
                    .orElseThrow(() -> new ResourceNotFoundException("TaxSlab not found with ID: " + requestDTO.getTaxSlabId()));
            product.setTaxSlab(taxSlab);
        }

        Product savedProduct = productRepository.save(product);

        boolean hasVariants = requestDTO.getVariants() != null && !requestDTO.getVariants().isEmpty();

        if (!hasVariants) {

            ProductVariantRequestDTO productVariantRequestDTO = new ProductVariantRequestDTO();
            productVariantRequestDTO.setVariantName(requestDTO.getProductName());
            productVariantRequestDTO.setItemCode(requestDTO.getItemCode());
            productVariantRequestDTO.setQuantity(0.0);
            productVariantRequestDTO.setShortDescription(requestDTO.getProductDisplayName());
            productVariantRequestDTO.setDetailedDescription(requestDTO.getProductDisplayName());
            productVariantRequestDTO.setVariantPrice(requestDTO.getBasePrice());
            productVariantRequestDTO.setMrp(requestDTO.getMrp());
            productVariantRequestDTO.setLandingCost(requestDTO.getLandingCost());
            productVariantRequestDTO.setPurchasePrice(requestDTO.getPurchasePrice());
            productVariantService.createVariant(savedProduct.getProductId(), productVariantRequestDTO);
        } else {

            for (ProductVariantRequestDTO variantDTO : requestDTO.getVariants()) {
                productVariantService.createVariant(savedProduct.getProductId(), variantDTO);
            }
        }

        // Reload from DB to get updated variants list
        Product freshProduct = productRepository.findById(savedProduct.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return convertToDTO(freshProduct);
    }

    @Override
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO, MultipartFile imageFile) {
        Product product = productRepository.findProductByProductId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setProductName(requestDTO.getProductName());
        product.setProductDisplayName(requestDTO.getProductDisplayName());
        product.setDescription(requestDTO.getDescription());
        product.setBasePrice(requestDTO.getBasePrice());
        product.setMrp(requestDTO.getMrp());
        product.setPurchasePrice(requestDTO.getPurchasePrice());
        product.setLandingCost(requestDTO.getLandingCost());

        // Upload new image if provided, otherwise use URL from DTO if present
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadImage(imageFile);
                product.setMainImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image to Cloudinary", e);
            }
        } else if (requestDTO.getMainImageUrl() != null) {
            product.setMainImageUrl(requestDTO.getMainImageUrl());
        }

        if (requestDTO.getBrandId() != null) {
            Brand brand = (Brand) brandRepository.findById(requestDTO.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with ID: " + requestDTO.getBrandId()));
            product.setBrand(brand);
        }

        if (requestDTO.getCategoryId() != null) {
            Category category = categoryRepository.findByCategoryId(requestDTO.getCategoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + requestDTO.getCategoryId()));
            product.setCategory(category);
        }

        if (requestDTO.getUnitId() != null) {
            Unit unit = (Unit) unitRepository.findById(requestDTO.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found with ID: " + requestDTO.getUnitId()));
            product.setUnit(unit);
        }

        if (requestDTO.getTaxSlabId() != null) {
            TaxSlab taxSlab = taxSlabRepository.findById(requestDTO.getTaxSlabId())
                    .orElseThrow(() -> new ResourceNotFoundException("TaxSlab not found with ID: " + requestDTO.getTaxSlabId()));
            product.setTaxSlab(taxSlab);
        }

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findProductByProductId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        product.setIsDeleted(true);
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Override
    public List<ProductResponseDTO> getProductsByCategoryId(Long categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        if (products.isEmpty()) {
            throw new ResourceNotFoundException("No products found in category: " + categoryId);
        }
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        List<Product> products = productRepository.findByBasePriceBetween(minPrice, maxPrice);
        if (products.isEmpty()) {
            throw new ResourceNotFoundException("No products found in price range");
        }
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDTO(product);
    }

    @Override
    public List<ProductResponseDTO> searchProducts(String keyword) {
        return productRepository.findByProductNameContainingIgnoreCase(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateStatus(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setIsActive(active);
        productRepository.save(product);
    }

    private ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO responseDTO = new ProductResponseDTO();

        responseDTO.setProductId(product.getProductId());
        responseDTO.setProductName(product.getProductName());
        responseDTO.setProductDisplayName(product.getProductDisplayName());
        responseDTO.setDescription(product.getDescription());
        responseDTO.setBasePrice(product.getBasePrice());
        responseDTO.setMrp(product.getMrp());
        responseDTO.setPurchasePrice(product.getPurchasePrice());
        responseDTO.setLandingCost(product.getLandingCost());
        responseDTO.setMainImageUrl(product.getMainImageUrl());
        responseDTO.setIsActive(product.getIsActive());
        responseDTO.setCreatedAt(product.getCreatedAt());
        responseDTO.setUpdatedAt(product.getUpdatedAt());


        if (product.getBrand() != null) {
            responseDTO.setBrandName(product.getBrand().getBrandName());
        }
        if (product.getCategory() != null) {
            responseDTO.setCategoryName(product.getCategory().getCategoryName());
        }
        if (product.getUnit() != null) {
            responseDTO.setUnitName(product.getUnit().getUnitName());
        }

        if (product.getTaxSlab() != null) {
            responseDTO.setTaxSlabName(product.getTaxSlab().getTaxName());
            responseDTO.setTaxPercentage(product.getTaxSlab().getTaxPercentage());
        }
        List<ProductVariantDTO> variantDTOs = product.getProductVariants() != null
                ? product.getProductVariants().stream()
                .filter(variant -> !variant.getIsDeleted())
                .map(variant -> {
                    ProductVariantDTO vDto = new ProductVariantDTO();
                    vDto.setVariantId(variant.getProductVariantId());
                    vDto.setItemCode(variant.getItemCode());
                    vDto.setVariantName(variant.getProductVariantName());
                    vDto.setIsActive(variant.getIsActive());
                    return vDto;
                }).collect(Collectors.toList())
                : new java.util.ArrayList<>();
        responseDTO.setVariants(variantDTOs);

        return responseDTO;
    }
}
