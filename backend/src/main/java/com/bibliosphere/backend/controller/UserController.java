package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @PostMapping("/wishlist/add")
    public ResponseEntity<String> addToWishlist(@RequestBody String isbn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String email = auth.getName();
            User currentUser = userService.getCurrentUser(email);
            userService.addProductToWishlist(currentUser, isbn);
            return ResponseEntity.ok("Product added to wishlist.");
        } else {
            return ResponseEntity.ok("Product added to wishlist.");
        }
    }

    @PostMapping("/wishlist/remove")
    public ResponseEntity<String> removeFromWishlist(@RequestBody String isbn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String email = auth.getName();
            User currentUser = userService.getCurrentUser(email);
            userService.removeProductFromWishlist(currentUser, isbn);
            return ResponseEntity.ok("Product added to wishlist.");
        } else {
            return ResponseEntity.ok("Product added to wishlist.");
        }
    }

    @PostMapping("/cart/add")
    public ResponseEntity<String> addToCart(@RequestParam String isbn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String email = auth.getName();
            User currentUser = userService.getCurrentUser(email);
            if (userService.addProductToCart(currentUser, isbn)){
                return ResponseEntity.ok("Product is added to cart.");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product is out of stock");
        } else {
            User user = new User();
            if (userService.addProductToCart(user, isbn)){
                user = null;
                return ResponseEntity.ok("Product is added to cart.");
            }
            user = null;
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product is out of stock");
        }
    }

    @PostMapping("/cart/remove")
    public ResponseEntity<String> removeFromCart(@RequestParam String isbn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String email = auth.getName();
            User currentUser = userService.getCurrentUser(email);
            if (userService.removeProductFromCart(currentUser, isbn)){
                return ResponseEntity.ok("Product is removed from cart.");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product is not in your list or there is no such product");
        } else {
            User user = new User();
            if (userService.removeProductFromCart(user, isbn)){
                user = null;
                return ResponseEntity.ok("Product is removed from cart.");
            }
            user = null;
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product is not in your list or there is no such product");
        }
    }
}
