package org.abrar.ecommerce.service.TaxSlab;

import org.abrar.ecommerce.dto.TaxSlabDTO;

import java.util.List;

public interface TaxSlabService {
    TaxSlabDTO createTaxSlab(TaxSlabDTO taxSlabDTO);

    TaxSlabDTO getTaxSlabById(Long taxSlabId);

    List<TaxSlabDTO> getAllTaxSlabs();

    TaxSlabDTO updateTaxSlab(Long taxSlabId, TaxSlabDTO taxSlabDTO);

    void deleteTaxSlab(Long taxSlabId);
}