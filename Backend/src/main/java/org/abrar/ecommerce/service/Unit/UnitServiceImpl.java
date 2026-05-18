package org.abrar.ecommerce.service.Unit;

import lombok.extern.log4j.Log4j2;
import org.abrar.ecommerce.dto.UnitDTO;
import org.abrar.ecommerce.entity.Unit;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Log4j2
public class UnitServiceImpl implements UnitService {

    @Autowired
    private UnitRepository unitRepository;

    @Override
    public UnitDTO createUnit(UnitDTO unitDTO) {
        Unit unit = new Unit();
        unit.setUnitName(unitDTO.getUnitName());
        unit.setIsActive(unitDTO.getIsActive() != null ? unitDTO.getIsActive() : true);
        unit.setShortName(unitDTO.getShortName());
        log.info("Creating new unit with name: {}", unitDTO.getShortName());
        unit.setIsDeleted(false);
        Unit savedUnit = unitRepository.save(unit);
        return convertToDTO(savedUnit);
    }

    @Override
    public UnitDTO getUnitById(Long unitId) {
        Unit unit = unitRepository.findById(unitId)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + unitId));
        return convertToDTO(unit);
    }

    @Override
    public List<UnitDTO> getAllUnits() {
        log.info("Getting all units"+unitRepository.findAllActiveUnits());
        return unitRepository.findAllActiveUnits().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UnitDTO updateUnit(Long unitId, UnitDTO unitDTO) {
        Unit unit = unitRepository.findById(unitId)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + unitId));

        unit.setUnitName(unitDTO.getUnitName());
        unit.setShortName(unitDTO.getShortName());
        if (unitDTO.getIsActive() != null) {
            unit.setIsActive(unitDTO.getIsActive());
        }
        Unit updatedUnit = unitRepository.save(unit);
        return convertToDTO(updatedUnit);
    }

    @Override
    public void deleteUnit(Long unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + unitId));
        unit.setIsDeleted(true);
        unit.setIsActive(false);
        unitRepository.save(unit);
    }

    private UnitDTO convertToDTO(Unit unit) {
        UnitDTO dto = new UnitDTO();
        dto.setUnitId(unit.getUnitId());
        dto.setUnitName(unit.getUnitName());
        dto.setIsActive(unit.getIsActive());
        dto.setCreatedAt(unit.getCreatedAt());
        dto.setShortName(unit.getShortName());
        dto.setUpdatedAt(unit.getUpdatedAt());
        return dto;
    }
}