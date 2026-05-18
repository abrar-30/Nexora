package org.abrar.ecommerce.controller.Auth;

import jakarta.validation.Valid;
import org.abrar.ecommerce.dto.Auth.AuthResponseDTO;
import org.abrar.ecommerce.dto.Auth.UserLoginDTO;
import org.abrar.ecommerce.dto.Auth.UserRegistrationDTO;
import org.abrar.ecommerce.service.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        AuthResponseDTO response = userService.register(registrationDTO);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDTO request) {
        AuthResponseDTO response = userService.login(request);
        return ResponseEntity.ok(response);
    }
}