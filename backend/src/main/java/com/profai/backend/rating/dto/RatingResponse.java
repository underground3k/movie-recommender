package com.profai.backend.rating.dto;

public record RatingResponse(
        Long id,
        Long userId,
        String username,
        Long movieId,
        String movieTitle,
        Integer stars
) {}