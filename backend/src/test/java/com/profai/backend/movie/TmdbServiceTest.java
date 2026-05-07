package com.profai.backend.movie;

import com.profai.backend.movie.dto.TmdbMovieData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@DisplayName("TmdbService unit tests")
class TmdbServiceTest {

    private TmdbService tmdbService;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        tmdbService = new TmdbService();
        ReflectionTestUtils.setField(tmdbService, "apiKey", "test-key");
        ReflectionTestUtils.setField(tmdbService, "imageUrl", "https://img.example/w500");
        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(tmdbService, "restTemplate");
        server = MockRestServiceServer.bindTo(restTemplate).build();
    }

    @Test
    void fetchesMovieDataAndBuildsPosterUrl() {
        server.expect(requestTo("https://api.themoviedb.org/3/search/movie?api_key=test-key&query=Inception"))
                .andRespond(withSuccess("""
                        {"results":[{"poster_path":"/poster.jpg","release_date":"2010-07-16","vote_average":8.4,"overview":"Dreams inside dreams"}]}
                        """, MediaType.APPLICATION_JSON));

        TmdbMovieData data = tmdbService.getMovieData("Inception");

        assertThat(data.posterUrl()).isEqualTo("https://img.example/w500/poster.jpg");
        assertThat(data.releaseDate()).isEqualTo("2010-07-16");
        assertThat(data.voteAverage()).isEqualTo(8.4);
        assertThat(data.overview()).isEqualTo("Dreams inside dreams");
        server.verify();
    }

    @Test
    void usesReleaseYearWhenFirstResultHasNoPoster() {
        server.expect(requestTo("https://api.themoviedb.org/3/search/movie?api_key=test-key&query=Matrix,%20The%20(1999)"))
                .andRespond(withSuccess("""
                        {"results":[{"release_date":"1999-03-31","vote_average":8.7,"overview":"fallback"}]}
                        """, MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://api.themoviedb.org/3/search/movie?api_key=test-key&query=Matrix,%20The%20(1999)&year=1999"))
                .andRespond(withSuccess("""
                        {"results":[{"poster_path":"/matrix.jpg","release_date":"1999-03-31","vote_average":8.7,"overview":"chosen"}]}
                        """, MediaType.APPLICATION_JSON));

        TmdbMovieData data = tmdbService.getMovieData("Matrix, The (1999)");

        assertThat(data.posterUrl()).isEqualTo("https://img.example/w500/matrix.jpg");
        assertThat(data.overview()).isEqualTo("chosen");
        server.verify();
    }

    @Test
    void enrichesMovieFromFetchedDataAndCachesResult() {
        server.expect(requestTo("https://api.themoviedb.org/3/search/movie?api_key=test-key&query=Inception"))
                .andRespond(withSuccess("""
                        {"results":[{"poster_path":"/poster.jpg","release_date":"2010-07-16","vote_average":8.4,"overview":"Dreams inside dreams"}]}
                        """, MediaType.APPLICATION_JSON));
        Movie movie = new Movie(10L, "Inception");

        tmdbService.enrichMovie(movie);

        assertThat(movie.getPosterUrl()).isEqualTo("https://img.example/w500/poster.jpg");
        assertThat(tmdbService.getPosterUrl("Inception")).isEqualTo("https://img.example/w500/poster.jpg");
        server.verify();
    }

    @Test
    void leavesMovieUnchangedWhenLookupIsEmpty() {
        server.expect(requestTo("https://api.themoviedb.org/3/search/movie?api_key=test-key&query=Unknown"))
                .andRespond(withSuccess("{\"results\":[]}", MediaType.APPLICATION_JSON));

        Movie movie = new Movie(99L, "Unknown");

        tmdbService.enrichMovie(movie);

        assertThat(movie.getPosterUrl()).isNull();
        server.verify();
    }

    @Test
    void buildsSearchCandidatesFromTitleVariants() {
        @SuppressWarnings("unchecked")
        Set<String> candidates = ReflectionTestUtils.invokeMethod(
                tmdbService,
                "buildSearchCandidates",
                "Amelie (a.k.a. Le Fabuleux Destin d'Amelie Poulain) (2001)",
                "Amelie (a.k.a. Le Fabuleux Destin d'Amelie Poulain)"
        );

        assertThat(candidates)
                .contains("Amelie", "Le Fabuleux Destin d'Amelie Poulain");
    }

    @Test
    void normalizesTrailingArticlesAndMojibake() {
        @SuppressWarnings("unchecked")
        Set<String> candidates = ReflectionTestUtils.invokeMethod(tmdbService, "buildSearchCandidates", "City, The", "City, The");

        assertThat(candidates).contains("The City");
    }

    @Test
    void extractsAliasesAndRepairsMojibakeCandidates() {
        @SuppressWarnings("unchecked")
        Set<String> aliases = ReflectionTestUtils.invokeMethod(tmdbService, "extractAliases", "Movie (1999) (Original Title)");
        @SuppressWarnings("unchecked")
        Set<String> candidates = ReflectionTestUtils.invokeMethod(tmdbService, "buildSearchCandidates", "AmÃ©lie", "AmÃ©lie");

        assertThat(aliases).containsExactly("Original Title");
        assertThat(candidates).contains("Amelie");
    }

    @Test
    void returnsEmptyDataWhenLookupThrowsUnexpectedException() {
        TmdbMovieData data = ReflectionTestUtils.invokeMethod(tmdbService, "fetchMovieData", (String) null);

        assertThat(data.isEmpty()).isTrue();
    }

    @Test
    void retriesFailedSearchAndReturnsEmptyData() {
        server.expect(requestTo("https://api.themoviedb.org/3/search/movie?api_key=test-key&query=Broken"))
                .andRespond(withServerError());
        server.expect(requestTo("https://api.themoviedb.org/3/search/movie?api_key=test-key&query=Broken"))
                .andRespond(withServerError());

        TmdbMovieData data = tmdbService.getMovieData("Broken");

        assertThat(data.isEmpty()).isTrue();
        server.verify();
    }

    @Test
    void privateExtractionHandlesNullAndBlankMovieFields() {
        TmdbMovieData nullResponse = ReflectionTestUtils.invokeMethod(tmdbService, "extractMovieData", (Object) null);
        TmdbMovieData blankFields = ReflectionTestUtils.invokeMethod(
                tmdbService,
                "toMovieData",
                java.util.Map.of(
                        "poster_path", " ",
                        "release_date", " ",
                        "overview", " "
                )
        );

        assertThat(nullResponse.isEmpty()).isTrue();
        assertThat(blankFields.isEmpty()).isTrue();
    }

    @Test
    void fallbackSelectionHandlesEmptyCandidateAndPartialCurrentData() {
        TmdbMovieData current = new TmdbMovieData(null, "1999-03-31", 8.7, null);
        TmdbMovieData candidateWithOverview = new TmdbMovieData(null, null, null, "overview");
        TmdbMovieData candidateWithPoster = new TmdbMovieData("poster.jpg", null, null, null);
        TmdbMovieData currentWithOverview = new TmdbMovieData(null, null, null, "existing");

        assertThat((TmdbMovieData) ReflectionTestUtils.invokeMethod(tmdbService, "pickBetterFallback", current, TmdbMovieData.empty()))
                .isSameAs(current);
        assertThat((TmdbMovieData) ReflectionTestUtils.invokeMethod(tmdbService, "pickBetterFallback", current, candidateWithOverview))
                .isSameAs(candidateWithOverview);
        assertThat((TmdbMovieData) ReflectionTestUtils.invokeMethod(tmdbService, "pickBetterFallback", currentWithOverview, candidateWithPoster))
                .isSameAs(candidateWithPoster);
        assertThat((TmdbMovieData) ReflectionTestUtils.invokeMethod(tmdbService, "pickBetterFallback", currentWithOverview, candidateWithOverview))
                .isSameAs(currentWithOverview);
    }

    @Test
    void privateTitleVariantMethodIgnoresBlankInput() {
        java.util.Set<String> candidates = new java.util.LinkedHashSet<>();

        ReflectionTestUtils.invokeMethod(tmdbService, "addTitleVariants", candidates, " ");

        assertThat(candidates).isEmpty();
    }
}
