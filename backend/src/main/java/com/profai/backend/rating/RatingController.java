package com.profai.backend.rating;

import com.profai.backend.rating.dto.RateMovieRequest;
import com.profai.backend.rating.dto.RatingResponse;
import com.profai.backend.rating.dto.UserRatingDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/{userId}")
    public List<UserRatingDto> getRatingsByUserId(@PathVariable Long userId) {
        return ratingService.getRatingsByUserId(userId);
    }
}