package org.abrar.ecommerce.service.Brand;

import org.abrar.ecommerce.dto.BrandDTO;
import org.abrar.ecommerce.entity.Brand;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandServiceImpl implements BrandService {

    @Autowired
    private BrandRepository brandRepository;

    @Override
    public BrandDTO createBrand(BrandDTO brandDTO) {
        Brand brand = new Brand();
        brand.setBrandName(brandDTO.getBrandName());
        brand.setIsActive(brandDTO.getIsActive() != null ? brandDTO.getIsActive() : true);
        brand.setIsDeleted(false);
        Brand savedBrand = brandRepository.save(brand);
        return convertToDTO(savedBrand);
    }

    @Override
    public BrandDTO getBrandById(Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));
        if (brand.getIsDeleted()) {
            throw new ResourceNotFoundException("Brand not found with id: " + brandId);
        }
        return convertToDTO(brand);
    }

    @Override
    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .filter(brand -> !brand.getIsDeleted())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BrandDTO updateBrand(Long brandId, BrandDTO brandDTO) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));

        brand.setBrandName(brandDTO.getBrandName());
        if (brandDTO.getIsActive() != null) {
            brand.setIsActive(brandDTO.getIsActive());
        }
        Brand updatedBrand = brandRepository.save(brand);
        return convertToDTO(updatedBrand);
    }

    @Override
    public void deleteBrand(Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));
        brand.setIsDeleted(true);
        brand.setIsActive(false);
        brandRepository.save(brand);
    }

    private BrandDTO convertToDTO(Brand brand) {
        BrandDTO dto = new BrandDTO();
        dto.setBrandId(brand.getBrandId());
        dto.setBrandName(brand.getBrandName());
        dto.setIsActive(brand.getIsActive());
        dto.setCreatedAt(brand.getCreatedAt());
        dto.setUpdatedAt(brand.getUpdatedAt());
        return dto;
    }
}