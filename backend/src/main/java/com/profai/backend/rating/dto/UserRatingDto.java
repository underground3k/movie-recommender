package com.profai.backend.rating.dto;

public record UserRatingDto(
        Long ratingId,
        Long movieId,
        String movieTitle,
        Integer stars
) {}