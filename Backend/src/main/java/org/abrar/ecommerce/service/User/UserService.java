package org.abrar.ecommerce.service.User;

import org.abrar.ecommerce.dto.Auth.AuthResponseDTO;
import org.abrar.ecommerce.dto.Auth.UserLoginDTO;
import org.abrar.ecommerce.dto.Auth.UserRegistrationDTO;
import org.abrar.ecommerce.dto.Auth.UserResponseDTO;

public interface UserService {
    AuthResponseDTO register(UserRegistrationDTO registrationDTO);

    AuthResponseDTO login(UserLoginDTO loginDTO);

    UserResponseDTO getUserById(Long id);

    UserResponseDTO updateUser(Long id, UserRegistrationDTO updateDTO);

    void deleteUser(Long id);
}