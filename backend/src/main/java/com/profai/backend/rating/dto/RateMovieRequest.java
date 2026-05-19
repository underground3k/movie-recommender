package com.profai.backend.rating.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RateMovieRequest(
        @JsonProperty("movieId") Long movieId,
        @JsonProperty("stars") Integer stars
) {}