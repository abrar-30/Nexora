package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.StockTransactionDTO;
import org.abrar.ecommerce.service.StockTransaction.StockTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stock-transactions")
public class StockTransactionController {

    @Autowired
    private StockTransactionService stockTransactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockTransactionDTO>>> getAllTransactions() {
        List<StockTransactionDTO> transactions = stockTransactionService.getAllTransactions();
        return ResponseEntity.ok(ApiResponse.success("Stock transactions fetched successfully", transactions));
    }
}

