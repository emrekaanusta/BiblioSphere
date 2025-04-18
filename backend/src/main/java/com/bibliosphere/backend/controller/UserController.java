package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


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

    @PostMapping("/wishlist/add")
    public ResponseEntity<String> addToWishlist(@RequestBody String isbn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            String email = auth.getName();
            User currentUser = userService.getCurrentUser(email);
            currentUser.setWishlist(currentUser.getWishlist().add())
        } else {
            return ResponseEntity.ok("Product added to wishlist.");
        }
    }

    @PostMapping("/wishlist/remove")
    public ResponseEntity<String> removeFromWishlist(@RequestBody String isbn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            String email = auth.getName();
            User currentUser = userService.getCurrentUser(email);
            userService.removeProductFromWishlist(currentUser, isbn);
            return ResponseEntity.ok("Product added to wishlist.");
        } else {
            return ResponseEntity.ok("Product added to wishlist.");
        }
    }

    //cart ekleme olayı
    @PostMapping("/cart/add")
    public ResponseEntity<String> addToCart(@RequestBody Map<String, String> payload) {
        String productId = payload.get("productId");
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in.");
        }
        try {
            userService.addProductToCart(currentUser, productId);
            return ResponseEntity.ok("Product added to cart.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // cart'tan urun cikarma
    @PostMapping("/cart/remove")
    public ResponseEntity<String> removeFromCart(@RequestBody Map<String, String> payload) {
        String productId = payload.get("productId");
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in.");
        }
        try {
            userService.removeProductFromCart(currentUser, productId);
            return ResponseEntity.ok("Product removed from cart.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
