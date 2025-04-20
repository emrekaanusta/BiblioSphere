package com.bibliosphere.backend.security;

import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        System.out.println("JWT Filter: Incoming URI -> " + request.getRequestURI());



        if (path.equals("/register") || path.equals("/login") ||
                path.startsWith("/favorites") || path.startsWith("/test")) {
            chain.doFilter(request, response);
            return;
        }

        // 🔽 Continue with JWT logic if not on a public route
        final String authorizationHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
                System.out.println("JWT Filter: Extracted email: " + email);
            } catch (Exception e) {
                System.out.println("JWT Filter: Error extracting email from token: " + e.getMessage());
            }
        } else {
            System.out.println("JWT Filter: Authorization header missing or does not start with 'Bearer '");
        }


        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userService.loadUserByEmail(email);


            System.out.println("Authorization: " + authorizationHeader);
            System.out.println("Extracted email: " + email);
            if (user == null) {
                System.out.println("No user found with email: " + email);
            } else {
                boolean valid = jwtUtil.validateToken(jwt, user.getEmail());
                System.out.println("Token validation result: " + valid);
            }



            if (user == null) {
                System.out.println("JWT Filter: No user found with email: " + email);
            } else {
                System.out.println("JWT Filter: Found user: " + user.getEmail());
                try {
                    boolean tokenValid = jwtUtil.validateToken(jwt, user.getEmail());
                    System.out.println("JWT Filter: Token validation result for " + user.getEmail() + " = " + tokenValid);
                    if (tokenValid) {
                        UsernamePasswordAuthenticationToken authenticationToken =
                                new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    } else {
                        System.out.println("JWT Filter: Token validation failed for user " + user.getEmail());
                    }
                } catch (Exception e) {
                    System.out.println("JWT Filter: Exception during token validation: " + e.getMessage());
                }
            }
        }

        chain.doFilter(request, response);
    }
}
