package com.profai.backend.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtService unit tests")
class JwtServiceTest {

    private static final String SECRET = "my-super-secret-key-my-super-secret-key";

    @Test
    void generatesSignedTokenWithEmailAndUserIdClaim() {
        JwtService jwtService = new JwtService(SECRET, 60_000L);

        String token = jwtService.generateToken("neo@example.com", 7L);

        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertThat(claims.getSubject()).isEqualTo("neo@example.com");
        assertThat(claims.get("userId", Number.class).longValue()).isEqualTo(7L);
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }
}
