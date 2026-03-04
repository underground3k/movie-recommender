package com.profai.backend.movie.dto;

import java.util.List;

public record MovieSummaryDto(
        Long id,
        String title,
        List<String> genres
) {}