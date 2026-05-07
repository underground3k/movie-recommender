package com.profai.backend.model;

import com.profai.backend.movie.Genre;
import com.profai.backend.movie.Movie;
import com.profai.backend.rating.Rating;
import com.profai.backend.user.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Entity model unit tests")
class EntityModelTest {

    @Test
    void userGettersAndSettersWork() {
        User user = new User("neo", "neo@example.com", "hash");

        user.setUsername("trinity");
        user.setEmail("trinity@example.com");
        user.setPassword("new-hash");

        assertThat(user.getUsername()).isEqualTo("trinity");
        assertThat(user.getEmail()).isEqualTo("trinity@example.com");
        assertThat(user.getPassword()).isEqualTo("new-hash");
        assertThat(user.getId()).isNull();
    }

    @Test
    void genreAndMovieExposeConstructorState() {
        Genre genre = new Genre("Action");
        Movie movie = new Movie(42L, "The Matrix");

        movie.getGenres().add(genre);

        assertThat(genre.getId()).isNull();
        assertThat(genre.getName()).isEqualTo("Action");
        assertThat(movie.getId()).isEqualTo(42L);
        assertThat(movie.getTitle()).isEqualTo("The Matrix");
        assertThat(movie.getGenres()).containsExactly(genre);
    }

    @Test
    void ratingStoresUserMovieAndStars() {
        User user = new User("neo", "neo@example.com", "hash");
        Movie movie = new Movie(42L, "The Matrix");
        Rating rating = new Rating(user, movie, 3);

        rating.setStars(5);

        assertThat(rating.getId()).isNull();
        assertThat(rating.getUser()).isSameAs(user);
        assertThat(rating.getMovie()).isSameAs(movie);
        assertThat(rating.getStars()).isEqualTo(5);
    }

    @Test
    void protectedJpaConstructorsAreAvailable() throws Exception {
        assertThat(newInstance(User.class)).isInstanceOf(User.class);
        assertThat(newInstance(Genre.class)).isInstanceOf(Genre.class);
        assertThat(newInstance(Movie.class)).isInstanceOf(Movie.class);
        assertThat(newInstance(Rating.class)).isInstanceOf(Rating.class);
    }

    private static <T> T newInstance(Class<T> type) throws Exception {
        Constructor<T> constructor = type.getDeclaredConstructor();
        constructor.setAccessible(true);
        return constructor.newInstance();
    }
}
