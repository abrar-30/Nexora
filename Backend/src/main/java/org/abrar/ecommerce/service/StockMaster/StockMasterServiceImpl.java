package org.abrar.ecommerce.service.StockMaster;

import org.abrar.ecommerce.dto.StockMasterDTO;
import org.abrar.ecommerce.dto.StockMasterRequestDTO;
import org.abrar.ecommerce.entity.ProductVariant;
import org.abrar.ecommerce.entity.StockMaster;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.ProductVariantRepository;
import org.abrar.ecommerce.repository.StockMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockMasterServiceImpl implements StockMasterService {

    @Autowired
    private StockMasterRepository stockMasterRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public StockMasterDTO createStock(StockMasterRequestDTO stockDTO) {
        if (stockDTO.getVariantId() == null) {
            throw new IllegalArgumentException("variantId is required for stock creation");
        }

        ProductVariant variant = productVariantRepository.findById(stockDTO.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with ID: " + stockDTO.getVariantId()));

        StockMaster stock = new StockMaster();
        stock.setVariant(variant);
        stock.setQuantity(stockDTO.getQuantity());
        stock.setExpiryDate(stockDTO.getExpiryDate());
        stock.setBatchNumber(
                stockDTO.getBatchNumber() != null
                        ? stockDTO.getBatchNumber()  // allow manual override
                        : generateBatchNumber(variant) // auto-generate if not provided
        );

        StockMaster saved = stockMasterRepository.save(stock);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public StockMasterDTO updateStock(Long stockId, StockMasterDTO stockDTO) {
        StockMaster stock = stockMasterRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found with ID: " + stockId));

        if (stockDTO.getQuantity() != null) {
            stock.setQuantity(stockDTO.getQuantity());
        }
        if (stockDTO.getExpiryDate() != null) {
            stock.setExpiryDate(stockDTO.getExpiryDate());
        }
        if (stockDTO.getBatchNumber() != null) {
            stock.setBatchNumber(stockDTO.getBatchNumber());
        }

        StockMaster updated = stockMasterRepository.save(stock);
        return convertToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public StockMasterDTO getStockById(Long stockId) {
        StockMaster stock = stockMasterRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found with ID: " + stockId));
        return convertToDTO(stock);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMasterDTO> getAllStocks() {
        return stockMasterRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMasterDTO> getStocksByVariantId(Long variantId) {
        return stockMasterRepository.findByVariantId(variantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAvailableQuantityByVariantId(Long variantId) {
        Double availableQty = stockMasterRepository.getAvailableQtyByVariantId(variantId);
        return availableQty != null ? availableQty : 0.0;
    }

    @Override
    @Transactional
    public void deleteStock(Long stockId) {
        StockMaster stock = stockMasterRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found with ID: " + stockId));
        stockMasterRepository.delete(stock);
    }

    private StockMasterDTO convertToDTO(StockMaster stock) {
        return new StockMasterDTO(
                stock.getStockId(),
                stock.getVariant() != null ? stock.getVariant().getProductVariantId() : null,
                stock.getVariant() != null ? stock.getVariant().getProductVariantName() : null,
                stock.getQuantity(),
                stock.getExpiryDate(),
                stock.getBatchNumber(),
                stock.getCreatedAt(),
                stock.getUpdatedAt()
        );
    }

    private String generateBatchNumber(ProductVariant variant) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String variantCode = variant.getItemCode().substring(0, 3).toUpperCase();
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(8);
        return "BATCH-" + datePart + "-" + variantCode + "-" + timestamp;
    }
}