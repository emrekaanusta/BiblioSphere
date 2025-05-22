package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.dto.UserProfileDto;
import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.security.JwtUtil;
import com.bibliosphere.backend.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final JwtUtil    jwtUtil;

    // —— REGISTER ——
    // both POST /register  and POST /api/users/register
    @PostMapping(path = {"/register", "/api/users/register"})
    public ResponseEntity<String> createUser(@RequestBody User user) {
        if (userService.exist(user.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("User already exists");
        }
        if (!userService.passwordCheck(user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Password must be longer than 6 characters and contain at least one special character");
        }
        userService.registerUser(user);
        return ResponseEntity.ok("User registered successfully");
    }

    // —— LOGIN ——
    // both POST /login and POST /api/users/login
    @PostMapping(path = {"/login", "/api/users/login"})
    public ResponseEntity<String> login(@RequestBody Map<String,String> creds) {
        String email = creds.get("email");
        String pw    = creds.get("password");
        String token = userService.login(email, pw);
        if (token != null) {
            return ResponseEntity.ok(token);
        }
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid credentials");
    }

    // —— GET PROFILE ——
    // GET /api/users/me
    @GetMapping("/api/users/me")
    public ResponseEntity<UserProfileDto> getMyProfile(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.loadUserByEmail(auth.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<Product> wishlist    = userService.loadProducts(user.getWishlist());
        List<Product> shoppingCart = userService.loadProducts(user.getShopping_cart());

        UserProfileDto dto = new UserProfileDto(
                user.getEmail(),
                user.getName(),
                user.getSurname(),
                user.getTaxid(),
                user.getAddress(),
                user.getCity(),
                user.getZipCode(),
                wishlist,
                shoppingCart
        );
        return ResponseEntity.ok(dto);
    }

    // —— UPDATE PROFILE ——
    // PUT /api/users/me
    @PutMapping("/api/users/me")
    public ResponseEntity<User> updateMyProfile(
            Authentication auth,
            @RequestBody Map<String,String> upd
    ) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.loadUserByEmail(auth.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (upd.containsKey("name"))    user.setName(upd.get("name"));
        if (upd.containsKey("surname")) user.setSurname(upd.get("surname"));
        if (upd.containsKey("taxid"))   user.setTaxid(upd.get("taxid"));
        if (upd.containsKey("address")) user.setAddress(upd.get("address"));
        if (upd.containsKey("city"))    user.setCity(upd.get("city"));
        if (upd.containsKey("ZipCode")) user.setZipCode(upd.get("ZipCode"));

        User saved = userService.update(user);
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }
}
