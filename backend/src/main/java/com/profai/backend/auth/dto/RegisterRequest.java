package com.profai.backend.auth.dto;

public record RegisterRequest(
        String username,
        String email,
        String password
) {}