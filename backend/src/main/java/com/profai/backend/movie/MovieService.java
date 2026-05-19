package com.profai.backend.movie;

import com.profai.backend.movie.dto.MovieDetailDto;
import com.profai.backend.movie.dto.MovieSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final TmdbService tmdbService;

    public MovieService(MovieRepository movieRepository, TmdbService tmdbService) {
        this.movieRepository = movieRepository;
        this.tmdbService = tmdbService;
    }

    @Transactional
    public Page<MovieSummaryDto> getMovies(Pageable pageable, String search) {
        Page<Movie> movies;

        if (search != null && !search.isBlank()) {
            movies = movieRepository.findByTitleContainingIgnoreCase(search.trim(), pageable);
        } else {
            movies = movieRepository.findAll(pageable);
        }

        movies.getContent().forEach(this::ensurePoster);

        return movies.map(m -> new MovieSummaryDto(
                m.getId(),
                m.getTitle(),
                m.getGenres().stream().map(Genre::getName).sorted().toList(),
                m.getPosterUrl()
        ));
    }

    @Transactional
    public MovieDetailDto getMovieById(Long id) {
        Movie m = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));

        ensurePoster(m);

        return new MovieDetailDto(
                m.getId(),
                m.getTitle(),
                m.getGenres().stream()
                        .map(Genre::getName)
                        .sorted(Comparator.naturalOrder())
                        .toList(),
                m.getPosterUrl(),
                m.getReleaseDate(),
                m.getVoteAverage(),
                m.getOverview()
        );
    }

    /**
     * Posters are fetched from TMDB only during the one-time MovieLens import,
     * which is skipped once the DB is populated. Movies imported before a valid
     * TMDB key was configured therefore stay without a poster forever.
     * Backfill lazily on read and persist the result so each movie is enriched
     * at most once.
     */
    private void ensurePoster(Movie movie) {
        if (movie.getPosterUrl() != null && !movie.getPosterUrl().isBlank()) {
            return;
        }

        tmdbService.enrichMovie(movie);

        if (movie.getPosterUrl() != null && !movie.getPosterUrl().isBlank()) {
            movieRepository.save(movie);
        }
    }
}
