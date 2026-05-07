package com.profai.backend.movie;

import com.profai.backend.movie.dto.MovieDetailDto;
import com.profai.backend.movie.dto.MovieSummaryDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("MovieService unit tests")
class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @Test
    void returnsPagedMoviesAndMapsSortedGenres() {
        Movie movie = new Movie(10L, "Inception");
        movie.getGenres().add(new Genre("Sci-Fi"));
        movie.getGenres().add(new Genre("Action"));
        movie.setPosterUrl("poster.jpg");

        Pageable pageable = PageRequest.of(0, 20);
        when(movieRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(movie), pageable, 1));

        Page<MovieSummaryDto> result = new MovieService(movieRepository).getMovies(pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).genres()).containsExactly("Action", "Sci-Fi");
        verify(movieRepository).findAll(pageable);
    }

    @Test
    void returnsMovieDetailsWithSortedGenres() {
        Movie movie = new Movie(10L, "Inception");
        movie.getGenres().add(new Genre("Thriller"));
        movie.getGenres().add(new Genre("Action"));
        movie.setOverview("Dreams inside dreams");
        movie.setPosterUrl("poster.jpg");
        movie.setReleaseDate("2010-07-16");
        movie.setVoteAverage(8.4);

        when(movieRepository.findById(10L)).thenReturn(Optional.of(movie));

        MovieDetailDto detail = new MovieService(movieRepository).getMovieById(10L);

        assertThat(detail.id()).isEqualTo(10L);
        assertThat(detail.genres()).containsExactly("Action", "Thriller");
        assertThat(detail.overview()).isEqualTo("Dreams inside dreams");
    }

    @Test
    void throwsNotFoundForMissingMovie() {
        when(movieRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new MovieService(movieRepository).getMovieById(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Movie not found");
    }
}
