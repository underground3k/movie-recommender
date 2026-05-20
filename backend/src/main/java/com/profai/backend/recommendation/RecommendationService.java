package com.profai.backend.recommendation;

import com.profai.backend.movie.Genre;
import com.profai.backend.movie.Movie;
import com.profai.backend.movie.MovieRepository;
import com.profai.backend.movie.dto.MovieDetailDto;
import com.profai.backend.rating.Rating;
import com.profai.backend.rating.RatingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private static final int RECOMMENDATION_LIMIT = 20;

    private final MovieRepository movieRepository;
    private final RatingRepository ratingRepository;

    public RecommendationService(MovieRepository movieRepository, RatingRepository ratingRepository) {
        this.movieRepository = movieRepository;
        this.ratingRepository = ratingRepository;
    }

    @Transactional(readOnly = true)
    public List<MovieDetailDto> getRecommendations(Long userId) {
        List<Rating> userRatings = ratingRepository.findByUserId(userId);

        if (userRatings.isEmpty()) {
            return movieRepository.findAll().stream()
                    .sorted(Comparator.comparing(
                            Movie::getVoteAverage,
                            Comparator.nullsLast(Comparator.reverseOrder())
                    ))
                    .limit(RECOMMENDATION_LIMIT)
                    .map(this::toDto)
                    .toList();
        }

        Set<Long> ratedMovieIds = userRatings.stream()
                .map(rating -> rating.getMovie().getId())
                .collect(Collectors.toSet());

        Set<String> likedGenres = userRatings.stream()
                .filter(rating -> rating.getStars() >= 4)
                .flatMap(rating -> rating.getMovie().getGenres().stream())
                .map(Genre::getName)
                .collect(Collectors.toSet());

        return movieRepository.findAll().stream()
                .filter(movie -> !ratedMovieIds.contains(movie.getId()))
                .filter(movie -> matchingGenreCount(movie, likedGenres) > 0)
                .sorted(Comparator
                        .comparingInt((Movie movie) -> matchingGenreCount(movie, likedGenres))
                        .reversed()
                        .thenComparing(
                                Movie::getVoteAverage,
                                Comparator.nullsLast(Comparator.reverseOrder())
                        ))
                .limit(RECOMMENDATION_LIMIT)
                .map(this::toDto)
                .toList();
    }

    private int matchingGenreCount(Movie movie, Set<String> likedGenres) {
        return (int) movie.getGenres().stream()
                .map(Genre::getName)
                .filter(likedGenres::contains)
                .count();
    }

    private MovieDetailDto toDto(Movie movie) {
        return new MovieDetailDto(
                movie.getId(),
                movie.getTitle(),
                movie.getGenres().stream()
                        .map(Genre::getName)
                        .sorted()
                        .toList(),
                movie.getPosterUrl(),
                movie.getReleaseDate(),
                movie.getVoteAverage(),
                movie.getOverview()
        );
    }
}
