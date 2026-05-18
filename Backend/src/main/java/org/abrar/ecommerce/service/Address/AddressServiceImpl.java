package org.abrar.ecommerce.service.Address;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.abrar.ecommerce.dto.AddressRequestDTO;
import org.abrar.ecommerce.dto.AddressResponseDTO;
import org.abrar.ecommerce.entity.*;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Override
    public AddressResponseDTO createAddress(AddressRequestDTO requestDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        City city = cityRepository.findById(requestDTO.getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + requestDTO.getCityId()));

        State state = stateRepository.findById(requestDTO.getStateId())
                .orElseThrow(() -> new ResourceNotFoundException("State not found: " + requestDTO.getStateId()));

        Country country = countryRepository.findById(requestDTO.getCountryId())
                .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + requestDTO.getCountryId()));

        // If new address is default, unset existing default
        if (Boolean.TRUE.equals(requestDTO.getIsDefault())) {
            unsetExistingDefault(user.getUserId());
        }

        // First address is always default
        boolean isFirstAddress = addressRepository.countByUserId(user.getUserId()) == 0;

        Address address = new Address();
        address.setUser(user);
        address.setAddressLine1(requestDTO.getAddressLine1());
        address.setAddressLine2(requestDTO.getAddressLine2());
        address.setCity(city);
        address.setState(state);
        address.setCountry(country);
        address.setPostalCode(requestDTO.getPostalCode());
        address.setPhoneNumber(requestDTO.getPhoneNumber());
        address.setIsDefault(isFirstAddress || Boolean.TRUE.equals(requestDTO.getIsDefault()));
        address.setIsDeleted(false);

        log.info("Creating address for user: {}", email);
        return convertToDTO(addressRepository.save(address));
    }

    @Override
    public AddressResponseDTO getAddressById(Long addressId, String email) {
        Address address = addressRepository.findByIdAndNotDeleted(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));

        validateOwnership(address, email);
        return convertToDTO(address);
    }

    @Override
    public List<AddressResponseDTO> getAllAddressesByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return addressRepository.findByUserAndNotDeleted(user.getUserId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AddressResponseDTO updateAddress(Long addressId, AddressRequestDTO requestDTO, String email) {
        Address address = addressRepository.findByIdAndNotDeleted(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));

        validateOwnership(address, email);

        City city = cityRepository.findById(requestDTO.getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + requestDTO.getCityId()));

        State state = stateRepository.findById(requestDTO.getStateId())
                .orElseThrow(() -> new ResourceNotFoundException("State not found: " + requestDTO.getStateId()));

        Country country = countryRepository.findById(requestDTO.getCountryId())
                .orElseThrow(() -> new ResourceNotFoundException("Country not found: " + requestDTO.getCountryId()));

        if (Boolean.TRUE.equals(requestDTO.getIsDefault())) {
            unsetExistingDefault(address.getUser().getUserId());
        }

        address.setAddressLine1(requestDTO.getAddressLine1());
        address.setAddressLine2(requestDTO.getAddressLine2());
        address.setCity(city);
        address.setState(state);
        address.setCountry(country);
        address.setPostalCode(requestDTO.getPostalCode());
        address.setPhoneNumber(requestDTO.getPhoneNumber());
        address.setIsDefault(requestDTO.getIsDefault() != null ? requestDTO.getIsDefault() : false);

        log.info("Updating address: {} for user: {}", addressId, email);
        return convertToDTO(addressRepository.save(address));
    }

    @Override
    public void deleteAddress(Long addressId, String email) {
        Address address = addressRepository.findByIdAndNotDeleted(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));

        validateOwnership(address, email);

        address.setIsDeleted(true);
        addressRepository.save(address);
        log.info("Deleted address: {} for user: {}", addressId, email);
    }

    @Override
    public AddressResponseDTO setDefaultAddress(Long addressId, String email) {
        Address address = addressRepository.findByIdAndNotDeleted(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));

        validateOwnership(address, email);

        unsetExistingDefault(address.getUser().getUserId());

        address.setIsDefault(true);
        log.info("Set default address: {} for user: {}", addressId, email);
        return convertToDTO(addressRepository.save(address));
    }

    // ---- Helpers ----

    private void unsetExistingDefault(Long userId) {
        addressRepository.findDefaultAddressByUserId(userId)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });
    }

    private void validateOwnership(Address address, String email) {
        if (!address.getUser().getEmail().equals(email)) {
            // Deliberately vague — don't expose address exists for another user
            throw new ResourceNotFoundException("Address not found: " + address.getAddressId());
        }
    }

    private AddressResponseDTO convertToDTO(Address address) {
        AddressResponseDTO dto = new AddressResponseDTO();
        dto.setAddressId(address.getAddressId());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setCityName(address.getCity().getCityName());
        dto.setStateName(address.getState().getStateName());
        dto.setCountryName(address.getCountry().getCountryName());
        dto.setPostalCode(address.getPostalCode());
        dto.setPhoneNumber(address.getPhoneNumber());
        dto.setIsDefault(address.getIsDefault());
        dto.setCreatedAt(address.getCreatedAt());
        dto.setUpdatedAt(address.getUpdatedAt());
        return dto;
    }
}

