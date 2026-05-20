package com.profai.backend.auth.dto;

public record LoginResponse(
        String token,
        Long userId,
        String username
) {}
