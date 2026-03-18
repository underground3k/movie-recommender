package com.profai.backend.movie.dto;

public record TmdbMovieData(
        String posterUrl,
        String releaseDate,
        Double voteAverage,
        String overview
) {
    public static TmdbMovieData empty() {
        return new TmdbMovieData(null, null, null, null);
    }

    public boolean isEmpty() {
        return posterUrl == null
                && releaseDate == null
                && voteAverage == null
                && overview == null;
    }
}
