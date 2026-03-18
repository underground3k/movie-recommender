package com.profai.backend.rating;

import com.profai.backend.rating.dto.RateMovieRequest;
import com.profai.backend.rating.dto.RatingResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ratings")
@CrossOrigin(origins = "*")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    public RatingResponse rateMovie(@RequestBody RateMovieRequest request) {
        return ratingService.rateMovie(request);
    }
}