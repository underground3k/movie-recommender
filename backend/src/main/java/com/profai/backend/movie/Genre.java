package com.profai.backend.movie;

import jakarta.persistence.*;

@Entity
@Table(
        name = "genres",
        uniqueConstraints = @UniqueConstraint(name = "uk_genre_name", columnNames = "name")
)
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String name;

    protected Genre() { } // required by JPA

    public Genre(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}