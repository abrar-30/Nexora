package org.abrar.ecommerce.service.Unit;

import org.abrar.ecommerce.dto.UnitDTO;

import java.util.List;

public interface UnitService {
    UnitDTO createUnit(UnitDTO unitDTO);

    UnitDTO getUnitById(Long unitId);

    List<UnitDTO> getAllUnits();

    UnitDTO updateUnit(Long unitId, UnitDTO unitDTO);

    void deleteUnit(Long unitId);
}