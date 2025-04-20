package com.bibliosphere.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                /* ---------- CORS (new style) ---------- */
                .cors(cors -> {})                    // use defaults; no deprecated .and()

                /* ---------- CSRF ---------- */
                .csrf(csrf -> csrf.disable())

                /* ---------- Session policy ---------- */
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                /* ---------- Authorisation rules ---------- */
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/register",
                                "/login",
                                "/favorites/**",
                                "/api/products",
                                "/api/products/**",
                                "/test-order",
                                "/test-email"
                        ).permitAll()
                        .requestMatchers("/api/ratings/**").authenticated()  // ✅ ADD THIS
                        .requestMatchers("/api/orders/**").authenticated()
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



}