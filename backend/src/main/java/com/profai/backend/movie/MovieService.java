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

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public Page<MovieSummaryDto> getMovies(Pageable pageable, String search) {
        Page<Movie> movies;

        if (search != null && !search.isBlank()) {
            movies = movieRepository.findByTitleContainingIgnoreCase(search.trim(), pageable);
        } else {
            movies = movieRepository.findAll(pageable);
        }

        return movies.map(m -> new MovieSummaryDto(
                m.getId(),
                m.getTitle(),
                m.getGenres().stream().map(Genre::getName).sorted().toList(),
                m.getPosterUrl()
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
                        .toList(),
                m.getPosterUrl(),
                m.getReleaseDate(),
                m.getVoteAverage(),
                m.getOverview()
        );
    }
}