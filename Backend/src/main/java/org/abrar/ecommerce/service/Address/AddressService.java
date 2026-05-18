package org.abrar.ecommerce.service.Address;

import org.abrar.ecommerce.dto.AddressRequestDTO;
import org.abrar.ecommerce.dto.AddressResponseDTO;

import java.util.List;

public interface AddressService {
    AddressResponseDTO createAddress(AddressRequestDTO requestDTO, String email);

    AddressResponseDTO getAddressById(Long addressId, String email);

    List<AddressResponseDTO> getAllAddressesByUser(String email);

    AddressResponseDTO updateAddress(Long addressId, AddressRequestDTO requestDTO, String email);

    void deleteAddress(Long addressId, String email);

    AddressResponseDTO setDefaultAddress(Long addressId, String email);
}
