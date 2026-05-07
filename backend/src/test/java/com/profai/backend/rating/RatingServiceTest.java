package com.profai.backend.rating;

import com.profai.backend.movie.Movie;
import com.profai.backend.movie.MovieRepository;
import com.profai.backend.rating.dto.RateMovieRequest;
import com.profai.backend.rating.dto.RatingResponse;
import com.profai.backend.rating.dto.UserRatingDto;
import com.profai.backend.user.User;
import com.profai.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RatingService unit tests")
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MovieRepository movieRepository;

    private RatingService ratingService;
    private User user;
    private Movie movie;

    @BeforeEach
    void setUp() {
        ratingService = new RatingService(ratingRepository, userRepository, movieRepository);

        user = new User("neo", "neo@example.com", "hashed-password");
        ReflectionTestUtils.setField(user, "id", 7L);

        movie = new Movie(42L, "The Matrix");
    }

    @Nested
    @DisplayName("rateMovie")
    class RateMovie {

        @ParameterizedTest
        @NullSource
        @ValueSource(ints = {0, 6})
        void rejectsMissingOrOutOfRangeStars(Integer stars) {
            RateMovieRequest request = new RateMovieRequest(7L, 42L, stars);

            assertThatThrownBy(() -> ratingService.rateMovie(request))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Stars must be between 1 and 5");

            verify(userRepository, never()).findById(any());
            verify(ratingRepository, never()).save(any());
        }

        @Test
        void createsNewRatingWhenUserHasNotRatedMovie() {
            when(userRepository.findById(7L)).thenReturn(Optional.of(user));
            when(movieRepository.findById(42L)).thenReturn(Optional.of(movie));
            when(ratingRepository.findByUserIdAndMovieId(7L, 42L)).thenReturn(Optional.empty());
            when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> {
                Rating rating = invocation.getArgument(0);
                ReflectionTestUtils.setField(rating, "id", 100L);
                return rating;
            });

            RatingResponse response = ratingService.rateMovie(new RateMovieRequest(7L, 42L, 5));

            assertThat(response.id()).isEqualTo(100L);
            assertThat(response.userId()).isEqualTo(7L);
            assertThat(response.username()).isEqualTo("neo");
            assertThat(response.movieId()).isEqualTo(42L);
            assertThat(response.movieTitle()).isEqualTo("The Matrix");
            assertThat(response.stars()).isEqualTo(5);

            ArgumentCaptor<Rating> ratingCaptor = ArgumentCaptor.forClass(Rating.class);
            verify(ratingRepository).save(ratingCaptor.capture());
            assertThat(ratingCaptor.getValue().getUser()).isSameAs(user);
            assertThat(ratingCaptor.getValue().getMovie()).isSameAs(movie);
        }

        @Test
        void updatesExistingRatingInsteadOfCreatingDuplicate() {
            Rating existingRating = new Rating(user, movie, 2);
            ReflectionTestUtils.setField(existingRating, "id", 33L);

            when(userRepository.findById(7L)).thenReturn(Optional.of(user));
            when(movieRepository.findById(42L)).thenReturn(Optional.of(movie));
            when(ratingRepository.findByUserIdAndMovieId(7L, 42L)).thenReturn(Optional.of(existingRating));
            when(ratingRepository.save(existingRating)).thenReturn(existingRating);

            RatingResponse response = ratingService.rateMovie(new RateMovieRequest(7L, 42L, 4));

            assertThat(response.id()).isEqualTo(33L);
            assertThat(response.stars()).isEqualTo(4);
            assertThat(existingRating.getStars()).isEqualTo(4);
            verify(ratingRepository).save(existingRating);
        }

        @Test
        void throwsNotFoundWhenMovieDoesNotExist() {
            when(userRepository.findById(7L)).thenReturn(Optional.of(user));
            when(movieRepository.findById(42L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ratingService.rateMovie(new RateMovieRequest(7L, 42L, 3)))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Movie not found");

            verify(ratingRepository, never()).save(any());
        }
    }

    @Test
    void returnsRatingsForExistingUser() {
        Movie secondMovie = new Movie(64L, "Inception");
        Rating firstRating = new Rating(user, movie, 5);
        Rating secondRating = new Rating(user, secondMovie, 3);
        ReflectionTestUtils.setField(firstRating, "id", 1L);
        ReflectionTestUtils.setField(secondRating, "id", 2L);

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(ratingRepository.findByUserId(7L)).thenReturn(List.of(firstRating, secondRating));

        List<UserRatingDto> ratings = ratingService.getRatingsByUserId(7L);

        assertThat(ratings)
                .extracting(UserRatingDto::movieTitle)
                .containsExactly("The Matrix", "Inception");
    }
}
