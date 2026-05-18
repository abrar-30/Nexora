package org.abrar.ecommerce.service.StockTransaction;

import org.abrar.ecommerce.dto.StockTransactionDTO;

import java.util.List;

public interface StockTransactionService {
    
    List<StockTransactionDTO> getAllTransactions();
}

