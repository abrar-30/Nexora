package org.abrar.ecommerce.service.User;

import org.abrar.ecommerce.dto.Auth.AuthResponseDTO;
import org.abrar.ecommerce.dto.Auth.UserLoginDTO;
import org.abrar.ecommerce.dto.Auth.UserRegistrationDTO;
import org.abrar.ecommerce.dto.Auth.UserResponseDTO;
import org.abrar.ecommerce.entity.User;
import org.abrar.ecommerce.entity.enums.Role;
import org.abrar.ecommerce.exception.ResourceNotFoundException;
import org.abrar.ecommerce.repository.UserRepository;
import org.abrar.ecommerce.security.JWTUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTUtil jwtUtil;

    @Override
    public AuthResponseDTO register(UserRegistrationDTO registrationDTO) {
        if (userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(registrationDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setFirstName(registrationDTO.getFirstName());
        user.setLastName(registrationDTO.getLastName());
        user.setRole(Role.CUSTOMER);
        user.setIsActive(true);
        user.setPhoneNumber(registrationDTO.getPhoneNumber());

        User savedUser = userRepository.save(user);
        logger.info("New user registered with email: {}", savedUser.getEmail());
        String token = jwtUtil.generateToken(savedUser);
        logger.info("JWT generated token: {}", token);
        UserResponseDTO userDTO = convertToResponseDTO(savedUser);
        return new AuthResponseDTO(token, userDTO, "User registered successfully");
    }

    @Override
    public AuthResponseDTO login(UserLoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getEmail(),
                        loginDTO.getPassword()
                )
        );


        User user = (User) authentication.getPrincipal();
        UserResponseDTO userDTO = convertToResponseDTO(user);
        String token = jwtUtil.generateToken(user);

        return new AuthResponseDTO(token, userDTO, "User is logged in successfully");
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToResponseDTO(user);
    }

    @Override
    public UserResponseDTO updateUser(Long id, UserRegistrationDTO updateDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFirstName(updateDTO.getFirstName());
        user.setLastName(updateDTO.getLastName());
        if (!updateDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateDTO.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return convertToResponseDTO(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    private UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRole(user.getRole().name());
        dto.setIsActive(user.getIsActive());
        return dto;
    }
}