package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Collections;
import java.util.List;

import com.bibliosphere.backend.security.JwtUtil;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        System.out.println("DEBUG: Incoming user = " + user);
        if (userService.exist(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
        }
        if (!userService.passwordCheck(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be longer than 6 characters and contain at least one special character");
        }
        userService.registerUser(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String token = userService.login(email, password);

        if (token != null) {
            return ResponseEntity.ok(token);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String email = jwtUtil.extractEmail(token.substring(7));
            userService.clearUserCart(email);
            return ResponseEntity.ok("Logged out successfully");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }

    @PostMapping("/wishlist/add")
    public ResponseEntity<String> addToWishlist(@RequestBody Map<String, String> payload, Authentication auth) {
        String productId = payload.get("productId");
        if (auth == null || productId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in or provide a product ID.");
        }
        String userId = auth.getName();
        User user = userService.loadUserByEmail(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        
        System.out.println("DEBUG: Adding product " + productId + " to wishlist for user " + userId);
        System.out.println("DEBUG: Current wishlist: " + user.getWishlist());
        
        User updatedUser = userService.addToWishlist(user, productId);
        
        System.out.println("DEBUG: Updated wishlist: " + updatedUser.getWishlist());
        
        return ResponseEntity.ok("Product added to wishlist successfully.");
    }
}
