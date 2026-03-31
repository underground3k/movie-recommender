package com.profai.backend.movie;

import com.profai.backend.movie.dto.TmdbMovieData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TmdbService {
    private static final int MAX_SEARCH_ATTEMPTS = 2;
    private static final Pattern YEAR_SUFFIX_PATTERN = Pattern.compile("\\s*\\((\\d{4})\\)$");
    private static final Pattern TRAILING_ARTICLE_PATTERN = Pattern.compile("^(.*),\\s(The|A|An)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern PARENTHETICAL_PATTERN = Pattern.compile("\\(([^()]*)\\)");
    private static final Pattern AKA_PATTERN = Pattern.compile("(?i)^a\\.k\\.a\\.\\s*(.+)$");
    private static final Pattern MOJIBAKE_HINT_PATTERN = Pattern.compile("[ÃÂÐÑ]");
    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{M}+");

    @Value("${tmdb.api-key}")
    private String apiKey;

    @Value("${tmdb.image-url}")
    private String imageUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, TmdbMovieData> movieCache = new ConcurrentHashMap<>();

    public void enrichMovie(Movie movie) {
        TmdbMovieData data = getMovieData(movie.getTitle());
        if (data == null || data.isEmpty()) return;

        movie.setPosterUrl(data.posterUrl());
        movie.setOverview(data.overview());
        movie.setReleaseDate(data.releaseDate());
        movie.setVoteAverage(data.voteAverage());
    }

    public TmdbMovieData getMovieData(String title) {
        TmdbMovieData cachedMovieData = movieCache.get(title);
        if (cachedMovieData != null && !cachedMovieData.isEmpty()) {
            return cachedMovieData;
        }

        TmdbMovieData fetchedMovieData = fetchMovieData(title);
        if (!fetchedMovieData.isEmpty()) {
            movieCache.put(title, fetchedMovieData);
        } else {
            movieCache.remove(title);
        }

        return fetchedMovieData;
    }

    public String getPosterUrl(String title) {
        return getMovieData(title).posterUrl();
    }

    private TmdbMovieData fetchMovieData(String title) {
        try {
            String baseTitle = stripYear(title);
            String releaseYear = extractYear(title);
            TmdbMovieData fallback = TmdbMovieData.empty();

            for (String candidate : buildSearchCandidates(title, baseTitle)) {
                TmdbMovieData movieData = searchMovie(candidate, null);
                fallback = pickBetterFallback(fallback, movieData);
                if (movieData.posterUrl() != null) {
                    return movieData;
                }

                if (releaseYear != null) {
                    movieData = searchMovie(candidate, releaseYear);
                    fallback = pickBetterFallback(fallback, movieData);
                    if (movieData.posterUrl() != null) {
                        return movieData;
                    }
                }
            }

            return fallback;
        } catch (Exception e) {
            System.out.println("TMDB lookup failed for: " + title);
            return TmdbMovieData.empty();
        }
    }

    private TmdbMovieData searchMovie(String candidate, String releaseYear) {
        String url = "https://api.themoviedb.org/3/search/movie?api_key="
                + apiKey + "&query={query}";
        Map<String, Object> uriVariables = new HashMap<>();
        uriVariables.put("query", candidate);

        if (releaseYear != null) {
            url += "&year={year}";
            uriVariables.put("year", releaseYear);
        }

        for (int attempt = 1; attempt <= MAX_SEARCH_ATTEMPTS; attempt++) {
            try {
                Map<?, ?> response = restTemplate.getForObject(url, Map.class, uriVariables);
                return extractMovieData(response);
            } catch (Exception exception) {
                if (attempt == MAX_SEARCH_ATTEMPTS) {
                    System.out.println("TMDB search failed for: " + candidate);
                }
            }
        }

        return TmdbMovieData.empty();
    }

    private TmdbMovieData extractMovieData(Map<?, ?> response) {
        if (response == null) {
            return TmdbMovieData.empty();
        }

        Object rawResults = response.get("results");
        if (!(rawResults instanceof List<?> results) || results.isEmpty()) {
            return TmdbMovieData.empty();
        }

        TmdbMovieData fallback = TmdbMovieData.empty();
        for (Object result : results) {
            if (result instanceof Map<?, ?> movie) {
                TmdbMovieData movieData = toMovieData(movie);
                fallback = pickBetterFallback(fallback, movieData);
                if (movieData.posterUrl() != null) {
                    return movieData;
                }
            }
        }

        return fallback;
    }

    private TmdbMovieData toMovieData(Map<?, ?> movie) {
        String posterUrl = null;
        Object path = movie.get("poster_path");
        if (path instanceof String posterPath && !posterPath.isBlank()) {
            posterUrl = imageUrl + posterPath;
        }

        String releaseDate = movie.get("release_date") instanceof String date && !date.isBlank()
                ? date
                : null;
        Double voteAverage = movie.get("vote_average") instanceof Number number
                ? number.doubleValue()
                : null;
        String overview = movie.get("overview") instanceof String text && !text.isBlank()
                ? text
                : null;

        return new TmdbMovieData(posterUrl, releaseDate, voteAverage, overview);
    }

    private TmdbMovieData pickBetterFallback(TmdbMovieData current, TmdbMovieData candidate) {
        if (current == null || current.isEmpty()) {
            return candidate;
        }
        if (candidate == null || candidate.isEmpty()) {
            return current;
        }
        if (current.posterUrl() == null && candidate.posterUrl() != null) {
            return candidate;
        }
        if (current.overview() == null && candidate.overview() != null) {
            return candidate;
        }
        return current;
    }

    private Set<String> buildSearchCandidates(String originalTitle, String baseTitle) {
        Set<String> candidates = new LinkedHashSet<>();
        addTitleVariants(candidates, originalTitle);
        addTitleVariants(candidates, baseTitle);

        String cleanedBaseTitle = stripParentheticalGroups(baseTitle);
        addTitleVariants(candidates, cleanedBaseTitle);

        for (String alias : extractAliases(baseTitle)) {
            addTitleVariants(candidates, alias);
        }

        candidates.removeIf(candidate -> candidate == null || candidate.isBlank());
        return candidates;
    }

    private void addTitleVariants(Set<String> candidates, String title) {
        if (title == null || title.isBlank()) {
            return;
        }

        String normalizedTitle = normalizeWhitespace(title);
        candidates.add(normalizedTitle);

        String fixedMojibakeTitle = fixMojibake(normalizedTitle);
        candidates.add(fixedMojibakeTitle);

        String deaccentedTitle = stripDiacritics(fixedMojibakeTitle);
        candidates.add(deaccentedTitle);

        addLeadingArticleVariant(candidates, normalizedTitle);
        addLeadingArticleVariant(candidates, fixedMojibakeTitle);
        addLeadingArticleVariant(candidates, deaccentedTitle);
    }

    private void addLeadingArticleVariant(Set<String> candidates, String title) {
        Matcher matcher = TRAILING_ARTICLE_PATTERN.matcher(title);
        if (matcher.matches()) {
            candidates.add(normalizeWhitespace(matcher.group(2) + " " + matcher.group(1)));
        }
    }

    private Set<String> extractAliases(String title) {
        Set<String> aliases = new LinkedHashSet<>();
        Matcher matcher = PARENTHETICAL_PATTERN.matcher(title);

        while (matcher.find()) {
            String group = normalizeWhitespace(matcher.group(1));
            if (group.isBlank() || group.matches("\\d{4}")) {
                continue;
            }

            Matcher akaMatcher = AKA_PATTERN.matcher(group);
            if (akaMatcher.matches()) {
                aliases.add(akaMatcher.group(1));
            } else {
                aliases.add(group);
            }
        }

        return aliases;
    }

    private String stripParentheticalGroups(String title) {
        return normalizeWhitespace(PARENTHETICAL_PATTERN.matcher(title).replaceAll(" "));
    }

    private String fixMojibake(String value) {
        if (!MOJIBAKE_HINT_PATTERN.matcher(value).find()) {
            return value;
        }

        String repaired = new String(value.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
        return normalizeWhitespace(repaired);
    }

    private String stripDiacritics(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        return normalizeWhitespace(DIACRITICS_PATTERN.matcher(normalized).replaceAll(""));
    }

    private String normalizeWhitespace(String value) {
        return value == null ? null : value.replaceAll("\\s+", " ").trim();
    }

    private String stripYear(String title) {
        return YEAR_SUFFIX_PATTERN.matcher(title).replaceFirst("").trim();
    }

    private String extractYear(String title) {
        Matcher matcher = YEAR_SUFFIX_PATTERN.matcher(title);
        return matcher.find() ? matcher.group(1) : null;
    }
}
