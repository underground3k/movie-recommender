package com.profai.backend.auth;

import com.profai.backend.auth.dto.RegisterRequest;
import com.profai.backend.auth.dto.RegisterResponse;
import com.profai.backend.user.User;
import com.profai.backend.user.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public RegisterResponse register(RegisterRequest request) {

        if (request.username() == null || request.username().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }

        if (request.email() == null || request.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        if (userRepository.findByUsernameIgnoreCase(request.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        if (userRepository.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        String hashedPassword = BCrypt.hashpw(request.password(), BCrypt.gensalt());

        User user = new User(
                request.username(),
                request.email(),
                hashedPassword
        );

        User saved = userRepository.save(user);

        return new RegisterResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail()
        );
    }
}