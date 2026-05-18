package org.abrar.ecommerce.controller;

import org.abrar.ecommerce.dto.ApiResponse;
import org.abrar.ecommerce.dto.UnitDTO;
import org.abrar.ecommerce.service.Unit.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/units")
@CrossOrigin(origins = "*")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @PostMapping
    public ResponseEntity<ApiResponse<UnitDTO>> createUnit(@RequestBody UnitDTO unitDTO) {
        return ResponseEntity.ok(ApiResponse.success("Unit created successfully",
                unitService.createUnit(unitDTO)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitDTO>> getUnitById(@PathVariable("id") Long unitId) {
        return ResponseEntity.ok(ApiResponse.success("Unit fetched",
                unitService.getUnitById(unitId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitDTO>>> getAllUnits() {
        return ResponseEntity.ok(ApiResponse.success("All units fetched",
                unitService.getAllUnits()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitDTO>> updateUnit(
            @PathVariable("id") Long unitId,
            @RequestBody UnitDTO unitDTO) {
        return ResponseEntity.ok(ApiResponse.success("Unit updated successfully",
                unitService.updateUnit(unitId, unitDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable("id") Long unitId) {
        unitService.deleteUnit(unitId);
        return ResponseEntity.ok(ApiResponse.success("Unit deleted successfully", null));
    }
}