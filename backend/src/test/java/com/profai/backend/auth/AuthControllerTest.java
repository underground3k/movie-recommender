package com.profai.backend.auth;

import com.profai.backend.auth.dto.LoginRequest;
import com.profai.backend.auth.dto.LoginResponse;
import com.profai.backend.auth.dto.RegisterRequest;
import com.profai.backend.auth.dto.RegisterResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController integration tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void registersUserThroughService() throws Exception {
        RegisterRequest request = new RegisterRequest("neo", "neo@example.com", "secret");
        when(authService.register(request)).thenReturn(new RegisterResponse(7L, "neo", "neo@example.com"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"neo\",\"email\":\"neo@example.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.username").value("neo"));

        verify(authService).register(request);
    }

    @Test
    void logsInUserThroughService() throws Exception {
        LoginRequest request = new LoginRequest("neo@example.com", "secret");
        when(authService.login(request)).thenReturn(new LoginResponse("jwt-token"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"neo@example.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));

        verify(authService).login(request);
    }
}
