package com.profai.backend.movie;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class TmdbService {

    @Value("${tmdb.api-key}")
    private String apiKey;

    @Value("${tmdb.image-url}")
    private String imageUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getPosterUrl(String title) {
        try {
            String url = "https://api.themoviedb.org/3/search/movie?api_key="
                    + apiKey + "&query=" + title;
            Map response = restTemplate.getForObject(url, Map.class);
            List results = (List) response.get("results");
            if (results != null && !results.isEmpty()) {
                Map first = (Map) results.get(0);
                String path = (String) first.get("poster_path");
                if (path != null) return imageUrl + path;
            }
        } catch (Exception e) {
            System.out.println("TMDB lookup failed for: " + title);
        }
        return null;
    }
}