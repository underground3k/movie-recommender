package com.profai.backend.auth;

import com.profai.backend.auth.dto.LoginRequest;
import com.profai.backend.auth.dto.LoginResponse;
import com.profai.backend.auth.dto.RegisterRequest;
import com.profai.backend.auth.dto.RegisterResponse;
import com.profai.backend.user.User;
import com.profai.backend.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mindrot.jbcrypt.BCrypt;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService unit tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Test
    void registersNewUserWithHashedPassword() {
        when(userRepository.findByUsernameIgnoreCase("trinity")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("trinity@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(org.mockito.Mockito.any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            ReflectionTestUtils.setField(user, "id", 11L);
            return user;
        });

        RegisterResponse response = new AuthService(userRepository, jwtService)
                .register(new RegisterRequest("trinity", "trinity@example.com", "plain-secret"));

        assertThat(response.id()).isEqualTo(11L);
        assertThat(response.username()).isEqualTo("trinity");
        assertThat(response.email()).isEqualTo("trinity@example.com");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPassword()).isNotEqualTo("plain-secret");
        assertThat(BCrypt.checkpw("plain-secret", userCaptor.getValue().getPassword())).isTrue();
    }

    @Test
    void rejectsDuplicateUsername() {
        when(userRepository.findByUsernameIgnoreCase("neo"))
                .thenReturn(Optional.of(new User("neo", "neo@example.com", "hash")));

        assertThatThrownBy(() -> new AuthService(userRepository, jwtService)
                .register(new RegisterRequest("neo", "other@example.com", "secret")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Username already exists");
    }

    @Test
    void rejectsDuplicateEmail() {
        when(userRepository.findByUsernameIgnoreCase("neo")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("neo@example.com"))
                .thenReturn(Optional.of(new User("other", "neo@example.com", "hash")));

        assertThatThrownBy(() -> new AuthService(userRepository, jwtService)
                .register(new RegisterRequest("neo", "neo@example.com", "secret")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email already exists");

        verify(userRepository, never()).save(org.mockito.Mockito.any(User.class));
    }

    @Test
    void rejectsMissingRegistrationFieldsBeforeSaving() {
        AuthService authService = new AuthService(userRepository, jwtService);

        assertThatThrownBy(() -> authService.register(new RegisterRequest(null, "neo@example.com", "secret")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Username is required");
        assertThatThrownBy(() -> authService.register(new RegisterRequest("neo", " ", "secret")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email is required");
        assertThatThrownBy(() -> authService.register(new RegisterRequest("neo", "neo@example.com", "")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Password is required");

        verify(userRepository, never()).save(org.mockito.Mockito.any(User.class));
    }

    @Test
    void logsInUserAndReturnsJwtToken() {
        User user = new User("neo", "neo@example.com", BCrypt.hashpw("correct", BCrypt.gensalt()));
        ReflectionTestUtils.setField(user, "id", 7L);

        when(userRepository.findByEmailIgnoreCase("neo@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("neo@example.com", 7L)).thenReturn("jwt-token");

        LoginResponse response = new AuthService(userRepository, jwtService)
                .login(new LoginRequest("neo@example.com", "correct"));

        assertThat(response.token()).isEqualTo("jwt-token");
    }

    @Test
    void rejectsInvalidPassword() {
        User user = new User("neo", "neo@example.com", BCrypt.hashpw("correct", BCrypt.gensalt()));
        when(userRepository.findByEmailIgnoreCase("neo@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> new AuthService(userRepository, jwtService)
                .login(new LoginRequest("neo@example.com", "wrong")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void rejectsMissingLoginFieldsAndUnknownEmail() {
        AuthService authService = new AuthService(userRepository, jwtService);

        assertThatThrownBy(() -> authService.login(new LoginRequest(null, "secret")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email is required");
        assertThatThrownBy(() -> authService.login(new LoginRequest("neo@example.com", " ")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Password is required");

        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> authService.login(new LoginRequest("missing@example.com", "secret")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
