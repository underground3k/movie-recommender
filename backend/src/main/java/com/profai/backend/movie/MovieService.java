package com.profai.backend.movie;

import com.profai.backend.movie.dto.MovieDetailDto;
import com.profai.backend.movie.dto.MovieSummaryDto;
import com.profai.backend.movie.dto.TmdbMovieData;
import jakarta.annotation.PreDestroy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final TmdbService tmdbService;
    private final ExecutorService posterLookupExecutor = Executors.newFixedThreadPool(4);

    public MovieService(MovieRepository movieRepository, TmdbService tmdbService) {
        this.movieRepository = movieRepository;
        this.tmdbService = tmdbService;
    }

    public Page<MovieSummaryDto> getMovies(Pageable pageable) {
        Page<Movie> moviePage = movieRepository.findAll(pageable);

        List<MovieCardData> movies = moviePage.getContent().stream()
                .map(movie -> new MovieCardData(
                        movie.getId(),
                        movie.getTitle(),
                        movie.getGenres().stream().map(Genre::getName).sorted().toList()
                ))
                .toList();

        List<MovieSummaryDto> content = movies.stream()
                .map(movie -> CompletableFuture.supplyAsync(
                        () -> new MovieSummaryDto(
                                movie.id(),
                                movie.title(),
                                movie.genres(),
                                tmdbService.getPosterUrl(movie.title())
                        ),
                        posterLookupExecutor
                ))
                .map(CompletableFuture::join)
                .toList();

        return new PageImpl<>(content, pageable, moviePage.getTotalElements());
    }

    public MovieDetailDto getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));

        TmdbMovieData tmdbMovieData = tmdbService.getMovieData(movie.getTitle());

        return new MovieDetailDto(
                movie.getId(),
                movie.getTitle(),
                movie.getGenres().stream()
                        .map(Genre::getName)
                        .sorted(Comparator.naturalOrder())
                        .toList(),
                tmdbMovieData.posterUrl(),
                tmdbMovieData.releaseDate(),
                tmdbMovieData.voteAverage(),
                tmdbMovieData.overview()
        );
    }

    private record MovieCardData(
            Long id,
            String title,
            List<String> genres
    ) {}

    @PreDestroy
    void shutdownExecutor() {
        posterLookupExecutor.shutdown();
    }
}
