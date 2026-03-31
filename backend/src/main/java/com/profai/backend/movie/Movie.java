package com.profai.backend.movie;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    private Long id; // you can use external API id or your own later

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column
    private String posterUrl;

    @Column
    private String releaseDate;

    @Column
    private Double voteAverage;
    @ManyToMany
    @JoinTable(
            name = "movie_genres",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();

    protected Movie() { } // required by JPA

    public Movie(Long id, String title) {
        this.id = id;
        this.title = title;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public Set<Genre> getGenres() { return genres; }
    public String getOverview() { return overview; }
    public String getPosterUrl() { return posterUrl; }
    public String getReleaseDate() { return releaseDate; }
    public Double getVoteAverage() { return voteAverage; }

    public void setOverview(String overview) { this.overview = overview; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
    public void setVoteAverage(Double voteAverage) { this.voteAverage = voteAverage; }

}