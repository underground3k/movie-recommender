package com.profai.backend.movie.dto;

import java.util.List;

public record MovieDetailDto(
        Long id,
        String title,
        List<String> genres,
        String posterUrl,
        String releaseDate,
        Double voteAverage,
        String overview
) {}
