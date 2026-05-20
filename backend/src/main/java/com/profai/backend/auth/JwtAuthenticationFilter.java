package com.profai.backend.auth;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter implements Filter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        boolean protectsPostRatings = "/ratings".equals(path) && "POST".equalsIgnoreCase(method);
        boolean protectsGetRatings = path.startsWith("/ratings/") && "GET".equalsIgnoreCase(method);
        boolean protectsGetRecommendations = "/recommendations".equals(path) && "GET".equalsIgnoreCase(method);

        if (protectsPostRatings || protectsGetRatings || protectsGetRecommendations) {
            String authHeader = httpRequest.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.getWriter().write("Missing or invalid Authorization header");
                return;
            }

            String token = authHeader.substring(7);

            if (!jwtService.isTokenValid(token)) {
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.getWriter().write("Invalid token");
                return;
            }

            Long userId = jwtService.extractUserId(token);
            httpRequest.setAttribute("userId", userId);
        }

        chain.doFilter(request, response);
    }
}
