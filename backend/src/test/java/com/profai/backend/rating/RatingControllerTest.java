package com.profai.backend.rating;

import com.profai.backend.rating.dto.RateMovieRequest;
import com.profai.backend.rating.dto.RatingResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RatingController.class)
@DisplayName("RatingController integration tests")
class RatingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RatingService ratingService;

    @Test
    void postsRatingRequestToService() throws Exception {
        RateMovieRequest request = new RateMovieRequest(7L, 42L, 5);
        when(ratingService.rateMovie(request))
                .thenReturn(new RatingResponse(100L, 7L, "neo", 42L, "The Matrix", 5));

        mockMvc.perform(post("/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":7,\"movieId\":42,\"stars\":5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(7))
                .andExpect(jsonPath("$.movieTitle").value("The Matrix"))
                .andExpect(jsonPath("$.stars").value(5));

        verify(ratingService).rateMovie(request);
    }

    @Test
    void getsRatingsForUser() throws Exception {
        when(ratingService.getRatingsByUserId(7L))
                .thenReturn(List.of(new com.profai.backend.rating.dto.UserRatingDto(9L, 42L, "The Matrix", 5)));

        mockMvc.perform(get("/ratings/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].movieId").value(42))
                .andExpect(jsonPath("$[0].stars").value(5));
    }
}
