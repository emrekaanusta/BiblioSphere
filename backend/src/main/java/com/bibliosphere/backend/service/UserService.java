package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.repository.UserRepository;
import com.bibliosphere.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public User loadUserByEmail(String email) {
        return userRepository.findById(email).orElse(null);
    }

    public boolean exist(String email) {
        return userRepository.findById(email).isPresent();
    }

    public static String encode(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public void registerUser(User user) {
        String temp_password = user.getPassword();
        user.setPassword(encode(temp_password));
        userRepository.save(user);
    }

    public String login(String email, String password) {
        if (userRepository.findById(email).isPresent()) {
            User user = loadUserByEmail(email);
            if (user != null && user.getPassword().equals(encode(password))) {
                return jwtUtil.generateToken(email);
            }
        }
        return null;
    }

    public boolean passwordCheck(String password) {
        char[] specialChars = {'!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+'};
        if (password.length() < 6) {
            return false;
        }
        for (char c : specialChars) {
            if (password.contains(String.valueOf(c))) {
                return true;
            }
        }
        return false;
    }

    // For demo: token is the user email (not secure).
    public User getUserFromToken(String token) {
        return userRepository.findById(token).orElse(null);
    }

    // Add a product ID to the user's wishlist
    public User addToWishlist(User user, String productId) {
        if (user.getWishlist() == null) {
            user.setWishlist(new ArrayList<>());  // create new empty list
        }
        if (!user.getWishlist().contains(productId)) {
            user.getWishlist().add(productId);
        }
        return userRepository.save(user);
    }

    // Remove a product ID from the user's wishlist
    public User removeFromWishlist(User user, String productId) {
        if (user.getWishlist() != null) {
            user.getWishlist().remove(productId);
        }
        return userRepository.save(user);
    }
}
