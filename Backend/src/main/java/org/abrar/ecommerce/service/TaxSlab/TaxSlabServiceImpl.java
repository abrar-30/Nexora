package org.abrar.ecommerce.service.TaxSlab;

import org.abrar.ecommerce.dto.TaxSlabDTO;
import org.abrar.ecommerce.entity.TaxSlab;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.TaxSlabRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaxSlabServiceImpl implements TaxSlabService {

    @Autowired
    private TaxSlabRepository taxSlabRepository;

    @Override
    public TaxSlabDTO createTaxSlab(TaxSlabDTO taxSlabDTO) {
        TaxSlab taxSlab = new TaxSlab();
        taxSlab.setTaxName(taxSlabDTO.getTaxName());
        taxSlab.setTaxPercentage(taxSlabDTO.getTaxPercentage());
        TaxSlab savedTaxSlab = taxSlabRepository.save(taxSlab);
        return convertToDTO(savedTaxSlab);
    }

    @Override
    public TaxSlabDTO getTaxSlabById(Long taxSlabId) {
        TaxSlab taxSlab = taxSlabRepository.findById(taxSlabId)
                .orElseThrow(() -> new ResourceNotFoundException("TaxSlab not found with id: " + taxSlabId));
        return convertToDTO(taxSlab);
    }

    @Override
    public List<TaxSlabDTO> getAllTaxSlabs() {
        return taxSlabRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaxSlabDTO updateTaxSlab(Long taxSlabId, TaxSlabDTO taxSlabDTO) {
        TaxSlab taxSlab = taxSlabRepository.findById(taxSlabId)
                .orElseThrow(() -> new ResourceNotFoundException("TaxSlab not found with id: " + taxSlabId));

        taxSlab.setTaxName(taxSlabDTO.getTaxName());
        taxSlab.setTaxPercentage(taxSlabDTO.getTaxPercentage());
        TaxSlab updatedTaxSlab = taxSlabRepository.save(taxSlab);
        return convertToDTO(updatedTaxSlab);
    }

    @Override
    public void deleteTaxSlab(Long taxSlabId) {
        if (!taxSlabRepository.existsById(taxSlabId)) {
            throw new ResourceNotFoundException("TaxSlab not found with id: " + taxSlabId);
        }
        taxSlabRepository.deleteById(taxSlabId);
    }

    private TaxSlabDTO convertToDTO(TaxSlab taxSlab) {
        TaxSlabDTO dto = new TaxSlabDTO();
        dto.setTaxSlabId(taxSlab.getTaxSlabId());
        dto.setTaxName(taxSlab.getTaxName());
        dto.setTaxPercentage(taxSlab.getTaxPercentage());
        return dto;
    }
}