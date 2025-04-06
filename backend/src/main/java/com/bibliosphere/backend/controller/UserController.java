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

@RestController
public class UserController {
    @Autowired
    private UserService userService;





    @PostMapping("/register")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        if (userService.exist(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
        }
        if (!userService.passwordCheck(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Password must be longer than 6 characters and contain at least one special character");
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

    @PostMapping("/wishlist/add")
    public ResponseEntity<?> addToWishlist(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> payload) {

        // Extract token from header (assuming format "Bearer <token>")
        String token = authHeader.replace("Bearer ", "");
        User currentUser = userService.getUserFromToken(token);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in.");
        }

        String productId = payload.get("productId");
        // Update user's wishlist and return updated wishlist
        currentUser = userService.addToWishlist(currentUser, productId);
        return ResponseEntity.ok(currentUser.getWishlist());
    }

    @PostMapping("/wishlist/remove")
    public ResponseEntity<?> removeFromWishlist(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> payload) {

        String token = authHeader.replace("Bearer ", "");
        User currentUser = userService.getUserFromToken(token);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in.");
        }

        String productId = payload.get("productId");
        currentUser = userService.removeFromWishlist(currentUser, productId);
        return ResponseEntity.ok(currentUser.getWishlist());
    }
}
