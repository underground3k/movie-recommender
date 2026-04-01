package com.profai.backend.movie;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class MovieLensImporter implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final TmdbService tmdbService;


    public MovieLensImporter(MovieRepository movieRepository, GenreRepository genreRepository, TmdbService tmdbService) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
        this.tmdbService = tmdbService;

    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // IMPORTANT: don’t import again if DB already has movies
        if (movieRepository.count() > 0) {
            System.out.println("MovieLens import skipped (movies already exist).");
            return;
        }

        System.out.println("Starting MovieLens import...");

        var resource = new ClassPathResource("movielens/movies.csv");

        try (var reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            reader.readLine(); // skip header

            String line;
            int imported = 0;

            while ((line = reader.readLine()) != null) {
                List<String> cols = parseCsvLine(line);
                if (cols.size() < 3) continue;

                Long movieId = Long.parseLong(cols.get(0));
                String title = cols.get(1);
                String genresStr = cols.get(2);

                Movie movie = new Movie(movieId, title);

                for (String genreName : parseGenres(genresStr)) {
                    Genre genre = genreRepository.findByNameIgnoreCase(genreName)
                            .orElseGet(() -> genreRepository.save(new Genre(genreName)));
                    movie.getGenres().add(genre);
                }
                tmdbService.enrichMovie(movie);
                movieRepository.save(movie);
                imported++;

                if (imported % 100 == 0) {
                    System.out.println("Imported: " + imported);
                }

                Thread.sleep(250);
            }

            System.out.println("✅ MovieLens import complete. Movies imported: " + imported);
        }
    }

    private static Set<String> parseGenres(String genresStr) {
        Set<String> out = new HashSet<>();
        if (genresStr == null) return out;

        String trimmed = genresStr.trim();
        if (trimmed.isEmpty() || trimmed.equalsIgnoreCase("(no genres listed)")) return out;

        for (String g : trimmed.split("\\|")) {
            String name = g.trim();
            if (!name.isEmpty()) out.add(name);
        }
        return out;
    }

    // Handles commas inside quoted titles:
    // 11,"American President, The (1995)",Comedy|Drama|Romance
    private static List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }

        result.add(sb.toString());
        return result;
    }
}