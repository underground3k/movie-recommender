package com.profai.backend.rating;

import com.profai.backend.rating.dto.RateMovieRequest;
import com.profai.backend.rating.dto.RatingResponse;
import com.profai.backend.rating.dto.UserRatingDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    public RatingResponse rateMovie(
            @RequestBody RateMovieRequest request,
            HttpServletRequest httpRequest
    ) {
        Long userId = (Long) httpRequest.getAttribute("userId");

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid token");
        }

        return ratingService.rateMovie(userId, request);
    }

    @GetMapping("/{userId}")
    public List<UserRatingDto> getRatingsByUserId(@PathVariable Long userId) {
        return ratingService.getRatingsByUserId(userId);
    }
}