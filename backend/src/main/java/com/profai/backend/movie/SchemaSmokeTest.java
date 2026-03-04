package com.profai.backend.movie;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SchemaSmokeTest implements CommandLineRunner {

    private final MovieRepository movieRepo;
    private final GenreRepository genreRepo;

    public SchemaSmokeTest(MovieRepository movieRepo, GenreRepository genreRepo) {
        this.movieRepo = movieRepo;
        this.genreRepo = genreRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (movieRepo.count() > 0) return;

        Genre action = genreRepo.save(new Genre("Action"));
        Movie m = new Movie(1L, "Test Movie");
        m.getGenres().add(action);
        movieRepo.save(m);
    }
}