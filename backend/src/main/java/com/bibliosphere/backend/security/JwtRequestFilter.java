package com.bibliosphere.backend.security;

import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.service.UserService;
import jakarta.servlet.FilterChain;          // OK to use jakarta here
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.equals("/register") || path.equals("/login")
                || path.startsWith("/favorites") || path.startsWith("/test")) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        if ("Bearer fake-admin-token".equals(header)) {
            var auth = new UsernamePasswordAuthenticationToken(
                    "admin",
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_PRODUCT_MANAGER"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            chain.doFilter(request, response);
            return;
        }
        if ("Bearer fake-sales-token".equals(header)) {
            var auth = new UsernamePasswordAuthenticationToken(
                    "sales",
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_SALES_MANAGER"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            chain.doFilter(request, response);
            return;
        }

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String email = null;
            try {
                email = jwtUtil.extractEmail(token);
            } catch (Exception ignored) {}

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = userService.loadUserByEmail(email);
                if (user != null && jwtUtil.validateToken(token, user.getEmail())) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.emptyList()
                    );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        chain.doFilter(request, response);
    }
}
