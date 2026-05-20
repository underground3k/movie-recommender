package com.profai.backend.auth;

import com.profai.backend.auth.dto.LoginRequest;
import com.profai.backend.auth.dto.LoginResponse;
import com.profai.backend.auth.dto.RegisterRequest;
import com.profai.backend.auth.dto.RegisterResponse;
import com.profai.backend.user.User;
import com.profai.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    // --- register ---

    @Test
    void register_validRequest_returnsResponse() {
        when(userRepository.findByUsernameIgnoreCase("jonas")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("jonas@test.com")).thenReturn(Optional.empty());

        User saved = new User("jonas", "jonas@test.com", "hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(saved);

        RegisterRequest request = new RegisterRequest("jonas", "jonas@test.com", "password123");
        RegisterResponse response = authService.register(request);

        assertThat(response.username()).isEqualTo("jonas");
        assertThat(response.email()).isEqualTo("jonas@test.com");
    }

    @Test
    void register_duplicateUsername_throwsBadRequest() {
        when(userRepository.findByUsernameIgnoreCase("jonas"))
                .thenReturn(Optional.of(new User("jonas", "kitas@test.com", "pass")));

        RegisterRequest request = new RegisterRequest("jonas", "jonas@test.com", "password123");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Username already exists");
    }

    @Test
    void register_duplicateEmail_throwsBadRequest() {
        when(userRepository.findByUsernameIgnoreCase("jonas")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("jonas@test.com"))
                .thenReturn(Optional.of(new User("kitas", "jonas@test.com", "pass")));

        RegisterRequest request = new RegisterRequest("jonas", "jonas@test.com", "password123");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void register_emptyUsername_throwsBadRequest() {
        RegisterRequest request = new RegisterRequest("", "jonas@test.com", "password123");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Username is required");
    }

    // --- login ---

    @Test
    void login_validCredentials_returnsToken() {
        String hashed = org.mindrot.jbcrypt.BCrypt.hashpw("password123", org.mindrot.jbcrypt.BCrypt.gensalt());
        User user = new User("jonas", "jonas@test.com", hashed);

        when(userRepository.findByEmailIgnoreCase("jonas@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(), any(), any())).thenReturn("mock-token");

        LoginRequest request = new LoginRequest("jonas@test.com", "password123");
        LoginResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("mock-token");
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        String hashed = org.mindrot.jbcrypt.BCrypt.hashpw("correctpassword", org.mindrot.jbcrypt.BCrypt.gensalt());
        User user = new User("jonas", "jonas@test.com", hashed);

        when(userRepository.findByEmailIgnoreCase("jonas@test.com")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest("jonas@test.com", "wrongpassword");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_emailNotFound_throwsUnauthorized() {
        when(userRepository.findByEmailIgnoreCase("nera@test.com")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("nera@test.com", "password123");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
