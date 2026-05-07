package com.profai.backend.movie;

import com.profai.backend.movie.dto.MovieDetailDto;
import com.profai.backend.movie.dto.MovieSummaryDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.refEq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MovieController.class)
@DisplayName("MovieController integration tests")
class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MovieService movieService;

    @Test
    void getMoviesReturnsPagedMovieSummaries() throws Exception {
        MovieSummaryDto summary = new MovieSummaryDto(10L, "Inception", List.of("Action", "Sci-Fi"), "poster.jpg");
        PageRequest pageable = PageRequest.of(0, 20);
        when(movieService.getMovies(refEq(pageable)))
                .thenReturn(new PageImpl<>(List.of(summary), pageable, 1));

        mockMvc.perform(get("/movies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(10))
                .andExpect(jsonPath("$.content[0].title").value("Inception"))
                .andExpect(jsonPath("$.content[0].genres[0]").value("Action"));
    }

    @Test
    void getMovieReturnsMovieDetail() throws Exception {
        MovieDetailDto detail = new MovieDetailDto(
                10L,
                "Inception",
                List.of("Action", "Sci-Fi"),
                "poster.jpg",
                "2010-07-16",
                8.4,
                "Dreams inside dreams"
        );
        when(movieService.getMovieById(10L)).thenReturn(detail);

        mockMvc.perform(get("/movies/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.overview").value("Dreams inside dreams"));
    }
}
