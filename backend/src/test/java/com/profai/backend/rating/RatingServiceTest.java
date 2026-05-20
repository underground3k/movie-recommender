package com.profai.backend.rating;

import com.profai.backend.movie.Movie;
import com.profai.backend.movie.MovieRepository;
import com.profai.backend.rating.dto.RateMovieRequest;
import com.profai.backend.rating.dto.RatingResponse;
import com.profai.backend.user.User;
import com.profai.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MovieRepository movieRepository;

    @InjectMocks
    private RatingService ratingService;

    // --- rateMovie ---

    @Test
    void rateMovie_newRating_savesSuccessfully() {
        User user = new User("jonas", "jonas@test.com", "hashed");
        Movie movie = new Movie(1L, "Inception");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        when(ratingRepository.findByUserIdAndMovieId(1L, 1L)).thenReturn(Optional.empty());

        Rating saved = new Rating(user, movie, 5);
        when(ratingRepository.save(any(Rating.class))).thenReturn(saved);

        RateMovieRequest request = new RateMovieRequest(1L, 5);
        RatingResponse response = ratingService.rateMovie(1L, request);

        assertThat(response.stars()).isEqualTo(5);
        assertThat(response.movieTitle()).isEqualTo("Inception");
    }

    @Test
    void rateMovie_updateExistingRating_savesNewStars() {
        User user = new User("jonas", "jonas@test.com", "hashed");
        Movie movie = new Movie(1L, "Inception");
        Rating existing = new Rating(user, movie, 3);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        when(ratingRepository.findByUserIdAndMovieId(1L, 1L)).thenReturn(Optional.of(existing));

        Rating updated = new Rating(user, movie, 5);
        when(ratingRepository.save(any(Rating.class))).thenReturn(updated);

        RateMovieRequest request = new RateMovieRequest(1L, 5);
        RatingResponse response = ratingService.rateMovie(1L, request);

        assertThat(response.stars()).isEqualTo(5);
    }

    @Test
    void rateMovie_starsZero_throwsBadRequest() {
        RateMovieRequest request = new RateMovieRequest(1L, 0);

        assertThatThrownBy(() -> ratingService.rateMovie(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Stars must be between 1 and 5");
    }

    @Test
    void rateMovie_starsSix_throwsBadRequest() {
        RateMovieRequest request = new RateMovieRequest(1L, 6);

        assertThatThrownBy(() -> ratingService.rateMovie(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Stars must be between 1 and 5");
    }

    @Test
    void rateMovie_starsNull_throwsBadRequest() {
        RateMovieRequest request = new RateMovieRequest(1L, null);

        assertThatThrownBy(() -> ratingService.rateMovie(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Stars must be between 1 and 5");
    }

    @Test
    void rateMovie_movieNotFound_throwsNotFound() {
        User user = new User("jonas", "jonas@test.com", "hashed");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(movieRepository.findById(99L)).thenReturn(Optional.empty());

        RateMovieRequest request = new RateMovieRequest(99L, 4);

        assertThatThrownBy(() -> ratingService.rateMovie(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Movie not found");
    }
}
