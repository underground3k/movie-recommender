package com.profai.backend.movie;

import com.profai.backend.movie.dto.MovieDetailDto;
import com.profai.backend.movie.dto.MovieSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    // GET /movies?page=0&size=20
    // GET /movies?page=0&size=20&search=inception
    @GetMapping
    public Page<MovieSummaryDto> getMovies(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        return movieService.getMovies(pageable, search);
    }

    // GET /movies/{id}
    @GetMapping("/{id}")
    public MovieDetailDto getMovie(@PathVariable Long id) {
        return movieService.getMovieById(id);
    }
}