package org.abrar.ecommerce.service.StockTransaction;

import org.abrar.ecommerce.dto.StockTransactionDTO;
import org.abrar.ecommerce.entity.StockTransaction;
import org.abrar.ecommerce.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockTransactionServiceImpl implements StockTransactionService {

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StockTransactionDTO> getAllTransactions() {
        List<StockTransaction> transactions = stockTransactionRepository.findAll();
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StockTransactionDTO convertToDTO(StockTransaction transaction) {
        StockTransactionDTO dto = new StockTransactionDTO();
        dto.setStockTransactionId(transaction.getStockTransactionId());
        dto.setVariantId(transaction.getProductVariant() != null ? transaction.getProductVariant().getProductVariantId() : null);
        dto.setInQuantity(transaction.getInQuantity());
        dto.setOutQuantity(transaction.getOutQuantity());
        dto.setDescription(transaction.getDescription());
        dto.setLandingCost(transaction.getLandingCost());
        dto.setSellingPrice(transaction.getSellingPrice());
        dto.setOrderId(transaction.getOrderId());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setUpdatedAt(transaction.getUpdatedAt());
        return dto;
    }
}


