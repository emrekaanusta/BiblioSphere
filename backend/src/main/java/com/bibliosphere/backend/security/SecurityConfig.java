package com.bibliosphere.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                /* ---------- CORS (new style) ---------- */
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                /* ---------- CSRF ---------- */
                .csrf(csrf -> csrf.disable())

                /* ---------- Session policy ---------- */
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                /* ---------- Authorisation rules ---------- */
                .authorizeHttpRequests(auth -> auth
                        // Permit all endpoints
                        .requestMatchers(
                                "/register",
                                "/login",
                                "/favorites/**",
                                "/test-order",
                                "/test-email"
                        ).permitAll()
                        
                        // Product endpoints
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products").authenticated()
                        .requestMatchers("/api/products/**").authenticated()
                        
                        // Categories endpoints
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        
                        // Ratings endpoints
                        .requestMatchers("/api/ratings/product/**").permitAll() // Allow public access to view ratings  
                        .requestMatchers("/api/ratings/**").authenticated() // Keep authentication for other rating operations
                        
                        // Books endpoints  
                        .requestMatchers("/api/books/**").permitAll() // Allow public access to book details
                        
                        // Orders endpoints
                        .requestMatchers("/api/orders/**").authenticated()
                        
                        // Sales manager endpoints
                        .requestMatchers("/api/sales-manager/**").permitAll() // TEMPORARILY PERMIT ALL FOR TESTING
                        //.requestMatchers("/api/sales-manager/**").hasRole("SALES_MANAGER") // Commented out for testing
                        
                        .anyRequest().authenticated()
                )

                /* ---------- Add JWT filter ---------- */
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:3000"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}




    