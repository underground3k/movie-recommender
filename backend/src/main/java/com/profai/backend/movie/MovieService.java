package com.profai.backend.movie;

import com.profai.backend.movie.dto.MovieDetailDto;
import com.profai.backend.movie.dto.MovieSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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

    public Page<MovieSummaryDto> getMovies(Pageable pageable) {
        return movieRepository.findAll(pageable)
                .map(m -> new MovieSummaryDto(
                        m.getId(),
                        m.getTitle(),
                        m.getGenres().stream().map(Genre::getName).sorted().toList(),
                        tmdbService.getPosterUrl(m.getTitle())
                ));
    }

    public MovieDetailDto getMovieById(Long id) {
        Movie m = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));

        return new MovieDetailDto(
                m.getId(),
                m.getTitle(),
                m.getGenres().stream()
                        .map(Genre::getName)
                        .sorted(Comparator.naturalOrder())
                        .toList()
        );
    }
}