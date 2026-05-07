package com.profai.backend.movie;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("MovieLensImporter unit tests")
class MovieLensImporterTest {

    @Test
    void skipsImportWhenMoviesAlreadyExist() throws Exception {
        MovieRepository movieRepository = mock(MovieRepository.class);
        GenreRepository genreRepository = mock(GenreRepository.class);
        TmdbService tmdbService = mock(TmdbService.class);
        when(movieRepository.count()).thenReturn(1L);

        new MovieLensImporter(movieRepository, genreRepository, tmdbService).run();

        verify(genreRepository, never()).findByNameIgnoreCase(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void importsMoviesFromClasspathCsv() throws Exception {
        MovieRepository movieRepository = mock(MovieRepository.class);
        GenreRepository genreRepository = mock(GenreRepository.class);
        TmdbService tmdbService = mock(TmdbService.class);

        when(movieRepository.count()).thenReturn(0L);
        when(genreRepository.findByNameIgnoreCase("Comedy")).thenReturn(Optional.of(new Genre("Comedy")));
        when(genreRepository.findByNameIgnoreCase(org.mockito.ArgumentMatchers.argThat(name -> !"Comedy".equals(name))))
                .thenReturn(Optional.empty());
        when(genreRepository.save(any(Genre.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(movieRepository.save(any(Movie.class))).thenAnswer(invocation -> invocation.getArgument(0));

        new MovieLensImporter(movieRepository, genreRepository, tmdbService).run();

        verify(movieRepository, times(100)).save(any(Movie.class));
        verify(tmdbService, times(100)).enrichMovie(any(Movie.class));
        verify(movieRepository).save(argThat(movie -> movie.getId().equals(2L)
                && movie.getTitle().equals("American President, The (1995)")
                && movie.getGenres().stream().map(Genre::getName).anyMatch("Comedy"::equals)));
    }

    @Test
    void parsesPipeSeparatedGenresAndIgnoresEmptyValues() {
        @SuppressWarnings("unchecked")
        Set<String> genres = ReflectionTestUtils.invokeMethod(
                MovieLensImporter.class,
                "parseGenres",
                "Action| Drama | |Comedy"
        );

        assertThat(genres).containsExactlyInAnyOrder("Action", "Drama", "Comedy");
    }

    @Test
    void returnsNoGenresForMissingOrNoGenreMarker() {
        @SuppressWarnings("unchecked")
        Set<String> missing = ReflectionTestUtils.invokeMethod(MovieLensImporter.class, "parseGenres", (String) null);
        @SuppressWarnings("unchecked")
        Set<String> noneListed = ReflectionTestUtils.invokeMethod(MovieLensImporter.class, "parseGenres", "(no genres listed)");

        assertThat(missing).isEmpty();
        assertThat(noneListed).isEmpty();
    }

    @Test
    void parsesCsvLineWithQuotedCommaInTitle() {
        @SuppressWarnings("unchecked")
        List<String> columns = ReflectionTestUtils.invokeMethod(
                MovieLensImporter.class,
                "parseCsvLine",
                "11,\"American President, The (1995)\",Comedy|Drama|Romance"
        );

        assertThat(columns).containsExactly("11", "American President, The (1995)", "Comedy|Drama|Romance");
    }
}
