package com.profai.backend.movie;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Highest-rated movies that actually have a vote average (skips the
    // un-enriched ones so they don't sort to the top as NULLs).
    List<Movie> findTop12ByVoteAverageIsNotNullOrderByVoteAverageDesc();
}