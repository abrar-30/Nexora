package org.abrar.ecommerce.service.Brand;

import org.abrar.ecommerce.dto.BrandDTO;

import java.util.List;

public interface BrandService {
    BrandDTO createBrand(BrandDTO brandDTO);

    BrandDTO getBrandById(Long brandId);

    List<BrandDTO> getAllBrands();

    BrandDTO updateBrand(Long brandId, BrandDTO brandDTO);

    void deleteBrand(Long brandId);
}