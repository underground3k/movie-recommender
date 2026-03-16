package com.profai.backend.rating;

import com.profai.backend.movie.Movie;
import com.profai.backend.movie.MovieRepository;
import com.profai.backend.rating.dto.RateMovieRequest;
import com.profai.backend.rating.dto.RatingResponse;
import com.profai.backend.user.User;
import com.profai.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    public RatingService(RatingRepository ratingRepository,
                         UserRepository userRepository,
                         MovieRepository movieRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }

    public RatingResponse rateMovie(RateMovieRequest request) {

        if (request.stars() == null || request.stars() < 1 || request.stars() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stars must be between 1 and 5");
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));

        Rating rating = ratingRepository.findByUserIdAndMovieId(request.userId(), request.movieId())
                .orElseGet(() -> new Rating(user, movie, request.stars()));

        rating.setStars(request.stars());

        Rating saved = ratingRepository.save(rating);

        return new RatingResponse(
                saved.getId(),
                saved.getUser().getId(),
                saved.getUser().getUsername(),
                saved.getMovie().getId(),
                saved.getMovie().getTitle(),
                saved.getStars()
        );
    }
}