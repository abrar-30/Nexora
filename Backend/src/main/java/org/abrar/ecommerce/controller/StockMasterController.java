package org.abrar.ecommerce.controller;

import jakarta.validation.Valid;
import org.abrar.ecommerce.dto.*;
import org.abrar.ecommerce.service.StockMaster.StockMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stock-master")
public class StockMasterController {

    @Autowired
    private StockMasterService stockMasterService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<StockMasterDTO>> createStock(
            @Valid @RequestBody StockMasterRequestDTO stockMasterRequestDTO) {
        StockMasterDTO stockMasterDTO = stockMasterService.createStock(stockMasterRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock created successfully", stockMasterDTO));
    }

    @GetMapping("/{stockId}")
    public ResponseEntity<ApiResponse<StockMasterDTO>> getStockById(@PathVariable Long stockId) {
        StockMasterDTO stockMasterDTO = stockMasterService.getStockById(stockId);
        return ResponseEntity.ok(ApiResponse.success("Stock fetched successfully", stockMasterDTO));
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<StockMasterDTO>>> getAllStocks() {
        List<StockMasterDTO> stocks = stockMasterService.getAllStocks();
        return ResponseEntity.ok(ApiResponse.success("Stocks fetched successfully", stocks));
    }

    @GetMapping("/variant/{variantId}")
    public ResponseEntity<ApiResponse<List<StockMasterDTO>>> getStocksByVariantId(
            @PathVariable Long variantId) {
        List<StockMasterDTO> stocks = stockMasterService.getStocksByVariantId(variantId);
        return ResponseEntity.ok(ApiResponse.success("Stocks fetched for variant: " + variantId, stocks));
    }

    @GetMapping("/variant/{variantId}/available-quantity")
    public ResponseEntity<ApiResponse<Double>> getAvailableQuantity(
            @PathVariable Long variantId) {
        Double qty = stockMasterService.getAvailableQuantityByVariantId(variantId);
        return ResponseEntity.ok(ApiResponse.success("Available quantity fetched", qty));
    }

    @PutMapping("/update/{stockId}")
    public ResponseEntity<ApiResponse<StockMasterDTO>> updateStock(
            @PathVariable Long stockId,
            @Valid @RequestBody StockMasterDTO stockMasterDTO) {
        StockMasterDTO updated = stockMasterService.updateStock(stockId, stockMasterDTO);
        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully", updated));
    }

    @DeleteMapping("/delete/{stockId}")
    public ResponseEntity<ApiResponse<Void>> deleteStock(@PathVariable Long stockId) {
        stockMasterService.deleteStock(stockId);
        return ResponseEntity.ok(ApiResponse.success("Stock deleted successfully", null));
    }
}





