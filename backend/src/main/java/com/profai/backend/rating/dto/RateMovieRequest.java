package com.profai.backend.rating.dto;

public record RateMovieRequest(
        Long movieId,
        Integer stars
) {}