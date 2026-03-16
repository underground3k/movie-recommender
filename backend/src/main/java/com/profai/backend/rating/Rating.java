package com.profai.backend.rating;

import com.profai.backend.movie.Movie;
import com.profai.backend.user.User;
import jakarta.persistence.*;

@Entity
@Table(
        name = "ratings",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_rating_user_movie", columnNames = {"user_id", "movie_id"})
        }
)
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(nullable = false)
    private Integer stars;

    protected Rating() {
    }

    public Rating(User user, Movie movie, Integer stars) {
        this.user = user;
        this.movie = movie;
        this.stars = stars;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Movie getMovie() {
        return movie;
    }

    public Integer getStars() {
        return stars;
    }

    public void setStars(Integer stars) {
        this.stars = stars;
    }
}