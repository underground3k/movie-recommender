package com.profai.backend.auth.dto;

public record RegisterResponse(
        Long id,
        String username,
        String email
) {}