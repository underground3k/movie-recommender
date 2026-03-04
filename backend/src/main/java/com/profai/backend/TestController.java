package com.profai.backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class TestController {

    private final JdbcTemplate jdbcTemplate;

    public TestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @GetMapping("/db-check")
    public String dbCheck() {
        Integer one = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return "DB OK: " + one;
    }
}