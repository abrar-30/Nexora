package org.abrar.ecommerce.service.StockMaster;

import org.abrar.ecommerce.dto.StockMasterDTO;
import org.abrar.ecommerce.dto.StockMasterRequestDTO;

import java.util.List;

public interface StockMasterService {
    StockMasterDTO createStock(StockMasterRequestDTO stockDTO);

    StockMasterDTO updateStock(Long stockId, StockMasterDTO stockDTO);

    StockMasterDTO getStockById(Long stockId);

    List<StockMasterDTO> getAllStocks();

    List<StockMasterDTO> getStocksByVariantId(Long variantId);

    Double getAvailableQuantityByVariantId(Long variantId);

    void deleteStock(Long stockId);
}