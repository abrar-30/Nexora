package org.abrar.ecommerce.service.Product;

import org.abrar.ecommerce.dto.ProductRequestDTO;
import org.abrar.ecommerce.dto.ProductResponseDTO;
import org.abrar.ecommerce.entity.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    ProductResponseDTO getProductById(Long id);

    List<ProductResponseDTO> getAllProducts();

    List<ProductResponseDTO> getAllActiveProducts();

    List<ProductResponseDTO> getProductsByBrandId(Long brandId);

    ProductResponseDTO createProduct(ProductRequestDTO requestDTO, MultipartFile imageFile);

    ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO, MultipartFile imageFile);

    void deleteProduct(Long id);

    List<ProductResponseDTO> getProductsByCategoryId(Long categoryId);

    List<ProductResponseDTO> getProductsByPriceRange(Double minPrice, Double maxPrice);

    List<ProductResponseDTO> searchProducts(String keyword);

    void updateStatus(Long id, boolean active);

}
