package com.profai.backend.movie;

import com.profai.backend.movie.dto.TmdbMovieData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TmdbMovieData unit tests")
class TmdbMovieDataTest {

    @Test
    void emptyFactoryReturnsEmptyData() {
        assertThat(TmdbMovieData.empty().isEmpty()).isTrue();
    }

    @Test
    void dataWithAnyFieldIsNotEmpty() {
        assertThat(new TmdbMovieData("poster.jpg", null, null, null).isEmpty()).isFalse();
        assertThat(new TmdbMovieData(null, "1999-03-31", null, null).isEmpty()).isFalse();
        assertThat(new TmdbMovieData(null, null, 8.7, null).isEmpty()).isFalse();
        assertThat(new TmdbMovieData(null, null, null, "overview").isEmpty()).isFalse();
    }
}
