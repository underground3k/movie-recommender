package com.profai.backend.auth.dto;

public record LoginRequest(
        String email,
        String password
) {}