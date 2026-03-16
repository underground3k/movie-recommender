package com.profai.backend.rating.dto;

public record RateMovieRequest(
        Long userId,
        Long movieId,
        Integer stars
) {}